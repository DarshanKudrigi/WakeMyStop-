/**
 * Smart Refresh Engine & Intelligent API Scheduler
 * Single Source of Truth for Live API refresh timing decisions.
 * Optimizes Railway API credit consumption (50 req/day limit) through dynamic intervals and decision rules.
 */

import { journeyCache } from './journeyCache'
import { activeJourneyStore } from './activeJourneyStore'
import { liveJourneyEngine } from './liveJourneyEngine'
import { buildLiveJourneyState } from './journeyTrackingEngine'

// Configurable Refresh Intervals Thresholds (in Minutes)
export const REFRESH_INTERVAL_RULES = [
  { minRemainingMinutes: 360, intervalMs: 60 * 60 * 1000 }, // > 6 Hours -> 60 mins
  { minRemainingMinutes: 180, intervalMs: 45 * 60 * 1000 }, // 3-6 Hours -> 45 mins
  { minRemainingMinutes: 60, intervalMs: 20 * 60 * 1000 },  // 1-3 Hours -> 20 mins
  { minRemainingMinutes: 30, intervalMs: 10 * 60 * 1000 },  // 30-60 Mins -> 10 mins
  { minRemainingMinutes: 0, intervalMs: 5 * 60 * 1000 },     // < 30 Mins -> 5 mins
]

/**
 * Calculates optimal refresh interval in ms based on remaining journey distance/time
 */
export function calculateRefreshIntervalMs(liveState) {
  if (!liveState) return 10 * 60 * 1000 // Default 10 mins

  // Estimate remaining journey time in minutes from remaining distance (assuming ~60 km/h average)
  const remainingDist = typeof liveState.distanceRemaining === 'number' ? liveState.distanceRemaining : 100
  const remainingMinutes = Math.round((remainingDist / 60) * 60)

  for (const rule of REFRESH_INTERVAL_RULES) {
    if (remainingMinutes >= rule.minRemainingMinutes) {
      return rule.intervalMs
    }
  }

  return 5 * 60 * 1000 // Default 5 mins
}

class SmartRefreshEngineManager {
  constructor() {
    this.activeTrainNo = null
    this.timerId = null
    this.isRefreshing = false
    this.isJourneyPageOpen = false
    this.listeners = new Set()
  }

  /**
   * Evaluates the 5-Step Refresh Decision Checklist
   */
  evaluateRefreshDecision(trainNo) {
    // 1. Is there an Active Journey?
    const store = activeJourneyStore.getStore()
    if (!store || store.journeyStatus !== 'Active') {
      return { canRefresh: false, reason: 'NO_ACTIVE_JOURNEY' }
    }

    // 2. Is the Journey page currently open?
    if (!this.isJourneyPageOpen) {
      return { canRefresh: false, reason: 'JOURNEY_PAGE_NOT_OPEN' }
    }

    // 3. Has cache expired (> 5 minutes old)?
    const cachedLive = journeyCache.get(trainNo, 'live')
    if (cachedLive && cachedLive.isValid) {
      return { canRefresh: false, reason: 'CACHE_STILL_VALID', cachedData: cachedLive.responseData }
    }

    // 4. Has another refresh already started?
    if (this.isRefreshing) {
      return { canRefresh: false, reason: 'REFRESH_IN_PROGRESS' }
    }

    // 5. All checks passed -> Proceed to refresh
    return { canRefresh: true, reason: 'CACHE_EXPIRED_AND_VISIBLE' }
  }

  /**
   * Starts scheduler ONLY when Journey page is mounted and visible
   */
  startScheduler(trainNo, subscriberCallback = null) {
    if (!trainNo) return
    this.activeTrainNo = String(trainNo).trim()
    this.isJourneyPageOpen = true

    if (subscriberCallback) {
      this.listeners.add(subscriberCallback)
    }

    console.log(`[SmartRefreshEngine] 🚀 Scheduler activated for train ${this.activeTrainNo} (Journey Page Visible)`)

    // Schedule next refresh cycle based on current journey progress
    this.scheduleNextCycle()
  }

  /**
   * Stops scheduler immediately when user navigates away from Journey page
   */
  stopScheduler() {
    this.isJourneyPageOpen = false
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
    console.log('[SmartRefreshEngine] 🛑 Scheduler stopped (User navigated away from Journey Page)')
  }

  /**
   * Schedules next refresh cycle dynamically
   */
  scheduleNextCycle() {
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }

    if (!this.isJourneyPageOpen || !this.activeTrainNo) return

    const store = activeJourneyStore.getStore()
    const currentProgress = store?.progressData || null
    const nextIntervalMs = calculateRefreshIntervalMs(currentProgress)

    console.log(`[SmartRefreshEngine] ⏰ Next dynamic refresh scheduled in ${Math.round(nextIntervalMs / 60000)} minutes`)

    this.timerId = setTimeout(async () => {
      await this.executeLiveRefresh(this.activeTrainNo)
      if (this.isJourneyPageOpen) {
        this.scheduleNextCycle()
      }
    }, nextIntervalMs)
  }

  /**
   * Executes live refresh dispatch via Live Journey Engine
   */
  async executeLiveRefresh(trainNo) {
    const decision = this.evaluateRefreshDecision(trainNo)

    if (!decision.canRefresh) {
      console.log(`[SmartRefreshEngine] ⚡ Skipping live refresh (Reason: ${decision.reason}) - 0 API calls`)
      return decision.cachedData || null
    }

    this.isRefreshing = true

    try {
      const result = await liveJourneyEngine.processLiveRefresh(trainNo)
      if (result && result.data) {
        this.notifyListeners(result.data)
        return result.data
      }
    } catch (err) {
      console.warn('[SmartRefreshEngine] Refresh attempt failed:', err.message)
    } finally {
      this.isRefreshing = false
    }

    return null
  }

  /**
   * Handles Manual Refresh Button click with strict cache age verification
   */
  async triggerManualRefresh(trainNo) {
    const targetTrain = trainNo || this.activeTrainNo
    if (!targetTrain) return null

    const cached = journeyCache.get(targetTrain, 'live') || journeyCache.get(targetTrain, 'details')

    // If cache is still valid (< 5 min), skip API call and reuse cache
    if (cached && cached.isValid) {
      console.log(`[SmartRefreshEngine] ⚡ Manual refresh reused valid cache for ${targetTrain} (0 API dispatches)`)
      const store = activeJourneyStore.getStore()
      const liveState = buildLiveJourneyState(cached.responseData, store || { trainNo: targetTrain })
      return {
        liveState,
        isFromCache: true,
        displayMessage: 'Updated a few seconds ago.',
      }
    }

    // Cache expired -> Dispatch live update
    const freshResult = await liveJourneyEngine.processLiveRefresh(targetTrain)
    return {
      liveState: freshResult?.data || null,
      isFromCache: false,
      displayMessage: freshResult?.error ? freshResult.error : 'Updated a few seconds ago.',
    }
  }

  /**
   * Notifies registered subscriber components
   */
  notifyListeners(data) {
    this.listeners.forEach((fn) => {
      try {
        fn(data)
      } catch (err) {
        console.error('[SmartRefreshEngine] Listener error:', err.message)
      }
    })
  }

  /**
   * Unsubscribes a listener
   */
  unsubscribe(fn) {
    this.listeners.delete(fn)
  }
}

export const smartRefreshEngine = new SmartRefreshEngineManager()
