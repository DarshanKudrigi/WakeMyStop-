/**
 * Live Journey Engine & Real-Time Journey State Synchronization
 * Single Source of Truth component for processing Live Status API responses,
 * performing granular state diffing, updating Journey Cache and Active Journey Store,
 * and synchronizing UI states without replacing entire state objects.
 */

import { getLiveTrainStatus } from '../services/trainService'
import { parseLiveStatusResponse } from './journeyTrackingEngine'
import { journeyCache } from '../cache/journeyCache'
import { activeJourneyStore } from '../store/activeJourneyStore'

class LiveJourneyEngineManager {
  constructor() {
    this.subscribers = new Set()
  }

  /**
   * Compares previous live state with newly parsed live state to perform granular diffing.
   * Merges updated fields while preserving existing metadata.
   */
  diffAndUpdateState(previousStoreState, newlyParsedState) {
    if (!newlyParsedState) return previousStoreState
    if (!previousStoreState) return newlyParsedState

    // Granular property comparison to detect actual changes
    const prevProgress = previousStoreState.progressData || previousStoreState
    const isStationChanged = prevProgress.currentStation?.code !== newlyParsedState.currentStation?.code
    const isDelayChanged = prevProgress.delayMinutes !== newlyParsedState.delayMinutes
    const isPercentageChanged = prevProgress.journeyPercentage !== newlyParsedState.journeyPercentage
    const isNextStationChanged = prevProgress.nextStation?.code !== newlyParsedState.nextStation?.code

    const hasMeaningfulChange = isStationChanged || isDelayChanged || isPercentageChanged || isNextStationChanged

    if (!hasMeaningfulChange) {
      console.log('[LiveJourneyEngine] ℹ️ Live response received, no meaningful state change detected.')
    } else {
      console.log(`[LiveJourneyEngine] 🔄 State change detected: Station [${prevProgress.currentStation?.code || 'NONE'} -> ${newlyParsedState.currentStation?.code}], Delay [${prevProgress.delayMinutes}m -> ${newlyParsedState.delayMinutes}m]`)
    }

    // Merge updated metrics onto previous store state to preserve journey metadata
    return {
      ...previousStoreState,
      currentStation: newlyParsedState.currentStation || previousStoreState.currentStation,
      nextStation: newlyParsedState.nextStation || previousStoreState.nextStation,
      previousStation: newlyParsedState.previousStation || previousStoreState.previousStation,
      delayMinutes: typeof newlyParsedState.delayMinutes === 'number' ? newlyParsedState.delayMinutes : previousStoreState.delayMinutes,
      expectedArrival: newlyParsedState.expectedArrival || previousStoreState.expectedArrival,
      journeyPercentage: typeof newlyParsedState.journeyPercentage === 'number' ? newlyParsedState.journeyPercentage : previousStoreState.journeyPercentage,
      distanceCovered: typeof newlyParsedState.distanceCovered === 'number' ? newlyParsedState.distanceCovered : previousStoreState.distanceCovered,
      distanceRemaining: typeof newlyParsedState.distanceRemaining === 'number' ? newlyParsedState.distanceRemaining : previousStoreState.distanceRemaining,
      runningStatus: newlyParsedState.runningStatus || previousStoreState.runningStatus,
      lastUpdated: newlyParsedState.lastUpdated || new Date().toISOString(),
      stops: Array.isArray(newlyParsedState.stops) && newlyParsedState.stops.length > 0 ? newlyParsedState.stops : (previousStoreState.stops || []),
    }
  }

  /**
   * Main Pipeline Coordinator Function
   * Fetches, validates, parses, caches, and syncs live status
   */
  async processLiveRefresh(trainNo) {
    if (!trainNo) return null

    const currentStore = activeJourneyStore.getStore()

    try {
      console.log(`[LiveJourneyEngine] 📡 Dispatching Live Status request for train ${trainNo}...`)
      const rawLiveResponse = await getLiveTrainStatus(trainNo, { bypassCache: true })

      if (!rawLiveResponse || !rawLiveResponse.success) {
        console.warn(`[LiveJourneyEngine] API response empty or unsuccessful for train ${trainNo}`)
        return {
          success: false,
          error: 'Live railway information is temporarily unavailable.',
          data: currentStore?.progressData || null,
        }
      }

      // Parse payload safely
      const parsedState = parseLiveStatusResponse(rawLiveResponse, currentStore || { trainNo })

      // Granular diffing & update
      const updatedState = this.diffAndUpdateState(currentStore?.progressData || currentStore, parsedState)

      // Update 5-minute Journey Cache
      journeyCache.set(trainNo, rawLiveResponse, 'live')

      // Update Active Journey Store
      if (currentStore) {
        activeJourneyStore.updateProgress(updatedState, rawLiveResponse)
      }

      // Notify reactive subscribers
      this.notifySubscribers(updatedState)

      return {
        success: true,
        error: null,
        data: updatedState,
      }
    } catch (err) {
      console.warn(`[LiveJourneyEngine] Error executing live refresh for train ${trainNo}:`, err.message)
      return {
        success: false,
        error: 'Live railway information is temporarily unavailable.',
        data: currentStore?.progressData || null,
      }
    }
  }

  /**
   * Subscribes reactive components to Live Journey Engine updates
   */
  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  /**
   * Broadcasts update to all subscribers
   */
  notifySubscribers(updatedState) {
    this.subscribers.forEach((cb) => {
      try {
        cb(updatedState)
      } catch (err) {
        console.error('[LiveJourneyEngine] Subscriber error:', err.message)
      }
    })
  }
}

export const liveJourneyEngine = new LiveJourneyEngineManager()
