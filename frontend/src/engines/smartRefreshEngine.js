/**
 * Smart Refresh Engine & Intelligent API Scheduler
 * Single Source of Truth for Live API refresh timing decisions.
 * Optimizes Railway API credit consumption through dynamic intervals, refresh budget caps, and singleton protection.
 */

import { journeyCache } from '../cache/journeyCache'
import { activeJourneyStore } from '../store/activeJourneyStore'
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
 * Returns maximum allowed API refresh budget based on total journey duration (in hours)
 */
export function getMaxAllowedRefreshes(totalHours = 3) {
  if (totalHours <= 2) return 6
  if (totalHours <= 5) return 8
  if (totalHours <= 8) return 10
  return 12
}

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
    this.refreshCount = 0
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

    // 3. Has total refresh count exceeded allocated journey budget cap?
    const totalDist = store.progressData?.totalDistance || 180
    const totalHours = Math.max(1, Math.round(totalDist / 60))
    const maxAllowed = getMaxAllowedRefreshes(totalHours)
    if (this.refreshCount >= maxAllowed) {
      return { canRefresh: false, reason: `REFRESH_BUDGET_EXCEEDED (${this.refreshCount}/${maxAllowed})` }
    }

    // 4. Has cache expired (< 3.5 minutes old)?
    const cachedLive = journeyCache.get(trainNo, 'live')
    if (cachedLive && cachedLive.isValid) {
      return { canRefresh: false, reason: 'CACHE_STILL_VALID', cachedData: cachedLive.responseData }
    }

    // 5. Has another refresh already started?
    if (this.isRefreshing) {
      return { canRefresh: false, reason: 'REFRESH_IN_PROGRESS' }
    }

    // All checks passed -> Proceed to refresh
    return { canRefresh: true, reason: 'CACHE_EXPIRED_AND_VISIBLE' }
  }

  /**
   * Starts scheduler ONLY when Journey page is mounted and visible (Strict Singleton Protection)
   */
  startScheduler(trainNo, subscriberCallback = null) {
    if (!trainNo) return
    const formattedNo = String(trainNo).trim()

    if (subscriberCallback) {
      this.listeners.add(subscriberCallback)
    }

    // Singleton Guard: If already running for same train number, avoid re-initialization
    if (this.isJourneyPageOpen && this.activeTrainNo === formattedNo && this.timerId) {
      return
    }

    this.activeTrainNo = formattedNo
    this.isJourneyPageOpen = true

    console.log(`[SmartRefreshEngine] 🚀 Scheduler started for train ${this.activeTrainNo}`)

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
    console.log('[SmartRefreshEngine] 🛑 Scheduler stopped')
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

    console.log(`[SmartRefreshEngine] ⏰ Next dynamic refresh scheduled in ${Math.round(nextIntervalMs / 60000)}m`)

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
      console.log(`[SmartRefreshEngine] ⚡ Skipping refresh (${decision.reason})`)
      return decision.cachedData || null
    }

    this.isRefreshing = true

    try {
      const result = await liveJourneyEngine.processLiveRefresh(trainNo)
      if (result && result.data) {
        this.refreshCount += 1
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

    // If cache is still valid (< 3.5 min), skip API call and reuse cache
    if (cached && cached.isValid) {
      console.log(`[SmartRefreshEngine] ⚡ Manual refresh reused cache for ${targetTrain} (0 API calls)`)
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
    if (freshResult && freshResult.data) {
      this.refreshCount += 1
    }

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
}

export const smartRefreshEngine = new SmartRefreshEngineManager()
