import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getActiveJourney, saveActiveJourney, cancelActiveJourney } from '../utils/activeJourney'
import { calculateJourneyProgress } from '../services/journeyEngine'
import { autoRefreshService } from '../services/autoRefreshService'
import { notificationService } from '../services/notificationService'

const JourneyContext = createContext(null)

export function JourneyProvider({ children }) {
  // Reactive Global Active Journey State
  const [activeJourney, setActiveJourney] = useState(() => getActiveJourney())

  // Restore journey state on mount & synchronize with auto-refresh service
  useEffect(() => {
    if (activeJourney && activeJourney.trainNo) {
      autoRefreshService.start(activeJourney.trainNo)
    } else {
      autoRefreshService.stop()
    }
  }, [activeJourney])

  // Subscribe to autoRefreshService updates
  useEffect(() => {
    const unsubscribe = autoRefreshService.subscribe((updatedStatus) => {
      setActiveJourney((prev) => {
        if (!prev) return null
        const progress = calculateJourneyProgress(null, updatedStatus.currentStation)
        const updated = {
          ...prev,
          status: updatedStatus.status || prev.status,
          delayMinutes: updatedStatus.delayMinutes ?? prev.delayMinutes,
          lastRefreshedAt: new Date().toISOString(),
          progress,
        }
        saveActiveJourney(updated)
        return updated
      })
    })

    return () => unsubscribe()
  }, [])

  /**
   * Starts & activates a new journey with user's selected alert preferences.
   * Enforces single-journey constraint.
   */
  const startJourney = useCallback((journeyPayload) => {
    const progress = calculateJourneyProgress(journeyPayload)
    const newJourney = {
      id: `jrn_${Date.now()}`,
      trainNo: journeyPayload.trainNo,
      trainName: journeyPayload.trainName,
      from: journeyPayload.from,
      to: journeyPayload.to,
      date: journeyPayload.date || 'Today, 28 Jul 2026',
      alertPreferences: journeyPayload.alertPreferences || {},
      status: 'Active',
      activatedAt: new Date().toISOString(),
      progress,
    }

    saveActiveJourney(newJourney)
    setActiveJourney(newJourney)
    autoRefreshService.start(newJourney.trainNo)

    // Trigger activation alert event
    notificationService.triggerAlert({
      type: 'JOURNEY_STARTED',
      message: `RailAlert AI started monitoring ${newJourney.trainName} (${newJourney.trainNo})`,
      trainNo: newJourney.trainNo,
      preferences: newJourney.alertPreferences,
    })

    return newJourney
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
   * Manual refresh trigger
   */
  const refreshJourney = useCallback(async () => {
    if (!activeJourney) return null
    await autoRefreshService.poll()
    const updated = getActiveJourney()
    setActiveJourney(updated)
    return updated
  }, [activeJourney])

  const value = {
    activeJourney,
    hasActiveJourney: Boolean(activeJourney),
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
