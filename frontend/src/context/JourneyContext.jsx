import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getActiveJourney, saveActiveJourney, cancelActiveJourney } from '../utils/activeJourney'
import { buildLiveJourneyState } from '../services/journeyTrackingEngine'
import { autoRefreshService } from '../services/autoRefreshService'
import { notificationService } from '../services/notificationService'

const JourneyContext = createContext(null)

export function JourneyProvider({ children }) {
  // Reactive Global Active Journey State
  const [activeJourney, setActiveJourney] = useState(() => getActiveJourney())

  const trainNo = activeJourney?.trainNo

  // Synchronize autoRefreshService ONLY when active trainNo changes
  useEffect(() => {
    if (trainNo && activeJourney?.journeyStatus === 'Active') {
      autoRefreshService.start(trainNo)
    } else {
      autoRefreshService.stop()
    }
    return () => {
      autoRefreshService.stop()
    }
  }, [trainNo, activeJourney?.journeyStatus])

  // Subscribe to autoRefreshService updates with single-source-of-truth normalization engine
  useEffect(() => {
    const unsubscribe = autoRefreshService.subscribe((rawLivePayload) => {
      if (!rawLivePayload) return
      setActiveJourney((prev) => {
        if (!prev) return null

        const updatedState = buildLiveJourneyState(rawLivePayload, prev)
        if (!updatedState) return prev

        saveActiveJourney(updatedState)
        return updatedState
      })
    })

    return () => unsubscribe()
  }, [])

  /**
   * Starts & activates a new journey with user's selected alert preferences.
   */
  const startJourney = useCallback((journeyPayload) => {
    const initialLiveState = buildLiveJourneyState(null, {
      ...journeyPayload,
      journeyStatus: 'Active',
      journeyId: `jrn_${Date.now()}`,
    })

    saveActiveJourney(initialLiveState)
    setActiveJourney(initialLiveState)

    // Trigger activation alert event ONCE
    notificationService.triggerAlert({
      type: 'JOURNEY_STARTED',
      message: `RailAlert AI started monitoring ${initialLiveState.trainName} (${initialLiveState.trainNo})`,
      trainNo: initialLiveState.trainNo,
      preferences: journeyPayload.alertPreferences || {},
    })

    // Immediately trigger poll to fetch live data
    autoRefreshService.start(initialLiveState.trainNo)

    return initialLiveState
  }, [])

  /**
   * Cancels the active journey
   */
  const cancelJourney = useCallback(() => {
    cancelActiveJourney()
    setActiveJourney(null)
    autoRefreshService.stop()
  }, [])

  /**
   * Completes the active journey
   */
  const completeJourney = useCallback(() => {
    cancelActiveJourney()
    setActiveJourney(null)
    autoRefreshService.stop()
  }, [])

  /**
   * Manual refresh trigger (Resets background 15s timer)
   */
  const refreshJourney = useCallback(async () => {
    if (!activeJourney) return null
    const rawData = await autoRefreshService.manualRefresh()
    if (rawData) {
      const updatedState = buildLiveJourneyState(rawData, activeJourney)
      saveActiveJourney(updatedState)
      setActiveJourney(updatedState)
      return updatedState
    }
    return activeJourney
  }, [activeJourney])

  const value = {
    activeJourney,
    hasActiveJourney: Boolean(activeJourney && activeJourney.journeyStatus === 'Active'),
    startJourney,
    cancelJourney,
    completeJourney,
    refreshJourney,
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
