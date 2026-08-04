import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { activeJourneyStore } from '../services/activeJourneyStore'
import { buildLiveJourneyState } from '../services/journeyTrackingEngine'
import { journeyCache } from '../services/journeyCache'
import { liveJourneyEngine } from '../services/liveJourneyEngine'
import { notificationService } from '../services/notificationService'

const JourneyContext = createContext(null)

export function JourneyProvider({ children }) {
  // Centralized Active Journey Store state
  const [activeJourney, setActiveJourney] = useState(() => activeJourneyStore.getStore())

  // Subscribe to liveJourneyEngine state synchronizations
  useEffect(() => {
    const unsubscribe = liveJourneyEngine.subscribe(() => {
      setActiveJourney(activeJourneyStore.getStore())
    })
    return () => unsubscribe()
  }, [])

  /**
   * Starts & activates a new journey using cached live data (0 additional API dispatches)
   */
  const startJourney = useCallback((journeyPayload) => {
    const trainNo = String(journeyPayload.trainNo || '').trim()

    // 1. Reuse 5-minute cached response if available
    const cachedDetails = journeyCache.get(trainNo, 'details')
    const cachedLive = journeyCache.get(trainNo, 'live')
    const rawPayload = cachedLive?.responseData || cachedDetails?.responseData || null

    const liveState = buildLiveJourneyState(rawPayload, {
      ...journeyPayload,
      journeyStatus: 'Active',
      journeyId: `jrn_${trainNo}_${Date.now()}`,
    })

    // 2. Save inside Centralized Active Journey Store
    const createdStore = activeJourneyStore.createActiveJourney({
      ...journeyPayload,
      trainNo,
      lastLiveResponse: rawPayload,
      liveState,
      cacheCreatedTime: cachedLive?.cachedAt || cachedDetails?.cachedAt || Date.now(),
      cacheExpiryTime: cachedLive?.expiresAt || cachedDetails?.expiresAt || (Date.now() + 5 * 60 * 1000),
    })

    setActiveJourney(createdStore)

    // Trigger activation alert event ONCE
    notificationService.triggerAlert({
      type: 'JOURNEY_STARTED',
      message: `RailAlert AI started monitoring ${createdStore.trainName} (${createdStore.trainNo})`,
      trainNo: createdStore.trainNo,
      preferences: journeyPayload.alertPreferences || {},
    })

    return createdStore
  }, [])

  /**
   * Cancels the active journey
   */
  const cancelJourney = useCallback(() => {
    activeJourneyStore.cancelJourney()
    setActiveJourney(null)
  }, [])

  /**
   * Completes the active journey
   */
  const completeJourney = useCallback(() => {
    activeJourneyStore.completeJourney()
    setActiveJourney(null)
  }, [])

  const value = {
    activeJourney,
    hasActiveJourney: Boolean(activeJourney && activeJourney.journeyStatus === 'Active'),
    startJourney,
    cancelJourney,
    completeJourney,
  }

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

export function useJourney() {
  const context = useContext(JourneyContext)
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider')
  }
  return context
}
