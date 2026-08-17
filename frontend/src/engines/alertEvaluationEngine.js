/**
 * Alert Evaluation Engine (Single Source of Truth for Journey Alerts)
 * Pure intelligence layer evaluating cached journey states with 0 additional RailRadar API calls.
 * 
 * Features:
 * - State transition evaluation (PREVIOUS vs CURRENT)
 * - Strict duplicate alert prevention
 * - Multi-train and journey-isolated state tracking
 * - Alert history persistence per journey
 * - Respect for user alert preferences
 * - Automatic journey completion lifecycle handling
 */

import { notificationService } from '../services/notificationService.js'

export const ALERT_TYPES = {
  JOURNEY_STARTED: 'JOURNEY_STARTED',
  DELAY_DETECTED: 'DELAY_DETECTED',
  DELAY_INCREASED: 'DELAY_INCREASED',
  DESTINATION_APPROACHING: 'DESTINATION_APPROACHING',
  DESTINATION_ARRIVAL: 'DESTINATION_ARRIVAL',
}

export const ALERT_SEVERITY = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
}

const STORAGE_HISTORY_PREFIX = 'railalert_alert_history_'
const DELAY_THRESHOLD_MINUTES = 5 // Minimum delay to consider meaningful
const CRITICAL_DELAY_MINUTES = 30 // Threshold for Critical delay severity

class AlertEvaluationEngineManager {
  constructor() {
    // In-memory tracker keyed by journeyId to maintain state transitions across refreshes
    this.journeyStates = new Map()
    this.sentAlertKeys = new Set()
    this.listeners = new Set()
  }

  /**
   * Generates a unique deduplication fingerprint for an alert event
   */
  createAlertKey(journeyId, trainNo, alertType, stateSignature) {
    return `${journeyId}_${trainNo}_${alertType}_${stateSignature}`
  }

  /**
   * Loads persisted alert history for a specific journey
   */
  getAlertHistory(journeyId) {
    if (!journeyId) return []
    try {
      const raw = localStorage.getItem(`${STORAGE_HISTORY_PREFIX}${journeyId}`)
      return raw ? JSON.parse(raw) : []
    } catch (err) {
      console.warn('[AlertEngine] Failed to read alert history from storage:', err.message)
      return []
    }
  }

  /**
   * Saves an alert record to the journey-specific alert history
   */
  saveAlertRecord(journeyId, alertRecord) {
    if (!journeyId || !alertRecord) return
    try {
      const currentHistory = this.getAlertHistory(journeyId)
      // Check if alert with same ID already exists
      if (!currentHistory.some((a) => a.id === alertRecord.id)) {
        const updated = [alertRecord, ...currentHistory]
        localStorage.setItem(`${STORAGE_HISTORY_PREFIX}${journeyId}`, JSON.stringify(updated))
        this.notifyListeners(updated, alertRecord)
      }
    } catch (err) {
      console.warn('[AlertEngine] Failed to save alert record to storage:', err.message)
    }
  }

  /**
   * Marks a specific alert as read
   */
  markAlertAsRead(journeyId, alertId) {
    if (!journeyId || !alertId) return
    try {
      const history = this.getAlertHistory(journeyId)
      const updated = history.map((a) => (a.id === alertId ? { ...a, read: true } : a))
      localStorage.setItem(`${STORAGE_HISTORY_PREFIX}${journeyId}`, JSON.stringify(updated))
      this.notifyListeners(updated)
    } catch (err) {
      console.warn('[AlertEngine] Failed to mark alert as read:', err.message)
    }
  }

  /**
   * Clears alert history for a journey
   */
  clearAlertHistory(journeyId) {
    if (!journeyId) return
    try {
      localStorage.removeItem(`${STORAGE_HISTORY_PREFIX}${journeyId}`)
      this.notifyListeners([])
    } catch (err) {
      console.warn('[AlertEngine] Failed to clear alert history:', err.message)
    }
  }

  /**
   * Retrieves or initializes the tracking state for a specific journey
   */
  getTrackingState(journeyId) {
    if (!this.journeyStates.has(journeyId)) {
      this.journeyStates.set(journeyId, {
        journeyStartedNotified: false,
        lastDelayNotified: 0,
        approachingNotified: false,
        arrivalNotified: false,
        lastStationCode: null,
      })
    }
    return this.journeyStates.get(journeyId)
  }

  /**
   * Parses proximity minutes from preferences notifyTime string (e.g., '30 Minutes' -> 30)
   */
  parseProximityMinutes(notifyTimeStr) {
    if (!notifyTimeStr) return 30
    const match = String(notifyTimeStr).match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 30
  }

  /**
   * Evaluates if train is approaching destination
   */
  isApproachingDestination(journeyState, preferences) {
    const notifyMinutes = this.parseProximityMinutes(preferences?.notifyTime)
    
    // 1. Remaining distance check (<= 25 km or proportional to notifyMinutes assuming 50-60 km/h)
    const distThresholdKm = Math.max(15, (notifyMinutes / 60) * 50)
    const distanceRemaining = typeof journeyState.distanceRemaining === 'number' ? journeyState.distanceRemaining : 100

    if (distanceRemaining <= distThresholdKm && distanceRemaining > 0) {
      return true
    }

    // 2. Next station is destination check
    const nextCode = journeyState.nextStation?.code
    const destCode = journeyState.to
    if (nextCode && destCode && nextCode === destCode) {
      return true
    }

    // 3. High journey percentage check (>= 85% and not completed)
    if (journeyState.journeyPercentage >= 85 && journeyState.journeyPercentage < 100) {
      return true
    }

    return false
  }

  /**
   * Evaluates if train has arrived at destination
   */
  hasArrivedAtDestination(journeyState) {
    if (!journeyState) return false

    // 1. Explicit completed status
    if (journeyState.journeyStatus === 'Completed' || journeyState.status === 'completed' || journeyState.runningStatus === 'Journey Completed') {
      return true
    }

    // 2. Current station matches destination
    const currCode = journeyState.currentStation?.code
    const destCode = journeyState.to
    if (currCode && destCode && currCode === destCode) {
      return true
    }

    // 3. Remaining distance is 0 or 100% completed
    if (journeyState.distanceRemaining === 0 && journeyState.journeyPercentage >= 99) {
      return true
    }

    return false
  }

  /**
   * Triggers an alert and records it in history with deduplication
   */
  dispatchAlert({
    journeyId,
    trainNo,
    trainName,
    alertType,
    message,
    triggerCondition,
    severity = ALERT_SEVERITY.INFO,
    stateSignature,
    preferences = {},
  }) {
    const dedupKey = this.createAlertKey(journeyId, trainNo, alertType, stateSignature)

    // Strict Deduplication Check
    if (this.sentAlertKeys.has(dedupKey)) {
      console.log(`[AlertEngine] 🛡️ Duplicate alert prevented (${alertType}: "${stateSignature}")`)
      return null
    }

    this.sentAlertKeys.add(dedupKey)

    const alertId = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const timestamp = new Date().toISOString()

    const alertRecord = {
      id: alertId,
      journeyId,
      trainNo: String(trainNo),
      trainName: trainName || 'Train Express',
      type: alertType,
      message,
      timestamp,
      triggerCondition,
      severity,
      read: false,
      channels: {
        inAppNotification: preferences.enableNotifications ?? true,
        alarmSound: preferences.alarmSound ? (preferences.soundType || 'Train Horn') : false,
        vibration: preferences.vibration ?? true,
        messageSms: preferences.messageNotification ?? false,
        phoneCall: preferences.phoneCallAlert ?? false,
      },
    }

    console.log(`[AlertEngine] 🔔 Alert created [${severity}] ${alertType}: ${message}`)

    // Save in journey-specific history
    this.saveAlertRecord(journeyId, alertRecord)

    // Dispatch via Notification Service
    notificationService.triggerAlert({
      ...alertRecord,
      preferences,
    })

    return alertRecord
  }

  /**
   * Primary Evaluation Function: Evaluates state changes for an active journey
   * Consumes in-memory ActiveJourneyStore or JourneyCache data.
   * NEVER performs an API request.
   */
  evaluateJourneyState(currentJourneyState, options = {}) {
    if (!currentJourneyState) {
      return []
    }

    const {
      journeyId = currentJourneyState.journeyId || `jrn_${currentJourneyState.trainNo}`,
      trainNo = currentJourneyState.trainNo,
      trainName = currentJourneyState.trainName,
      alertPreferences = currentJourneyState.alertPreferences || currentJourneyState.preferences || {},
    } = currentJourneyState

    // If notifications are completely disabled by user, skip evaluation
    if (alertPreferences.enableNotifications === false) {
      console.log(`[AlertEngine] ℹ️ Notifications disabled in preferences for journey ${journeyId}`)
      return []
    }

    console.log(`[AlertEngine] 🔍 Evaluating journey state for train ${trainNo} (${trainName})...`)

    const tracking = this.getTrackingState(journeyId)
    const generatedAlerts = []

    // 1. JOURNEY STARTED ALERT
    if (!tracking.journeyStartedNotified && currentJourneyState.journeyStatus === 'Active') {
      const alert = this.dispatchAlert({
        journeyId,
        trainNo,
        trainName,
        alertType: ALERT_TYPES.JOURNEY_STARTED,
        message: `RailAlert AI started monitoring your journey on ${trainName}.`,
        triggerCondition: 'Journey activation confirmed',
        severity: ALERT_SEVERITY.INFO,
        stateSignature: 'initial_activation',
        preferences: alertPreferences,
      })
      if (alert) {
        tracking.journeyStartedNotified = true
        generatedAlerts.push(alert)
      }
    }

    // 2. DESTINATION ARRIVAL CHECK (Highest Priority Terminal Event)
    const hasArrived = this.hasArrivedAtDestination(currentJourneyState)
    if (hasArrived && !tracking.arrivalNotified) {
      const alert = this.dispatchAlert({
        journeyId,
        trainNo,
        trainName,
        alertType: ALERT_TYPES.DESTINATION_ARRIVAL,
        message: `You have arrived at your destination (${currentJourneyState.toName || currentJourneyState.to || 'Destination'}).`,
        triggerCondition: `Train reached destination ${currentJourneyState.to}`,
        severity: ALERT_SEVERITY.INFO,
        stateSignature: `arrival_${currentJourneyState.to}`,
        preferences: alertPreferences,
      })

      if (alert) {
        tracking.arrivalNotified = true
        generatedAlerts.push(alert)
        console.log(`[AlertEngine] 🏁 Journey completed for train ${trainNo}`)

        // Trigger journey completion callback if provided
        if (options.onJourneyCompleted) {
          try {
            options.onJourneyCompleted(journeyId)
          } catch (err) {
            console.error('[AlertEngine] onJourneyCompleted callback error:', err.message)
          }
        }
      }

      // Terminal event -> Stop further alert evaluations for this journey
      return generatedAlerts
    }

    // 3. DESTINATION APPROACHING ALERT
    if (!tracking.approachingNotified && !tracking.arrivalNotified) {
      const isApproaching = this.isApproachingDestination(currentJourneyState, alertPreferences)
      if (isApproaching) {
        const notifyTimeText = alertPreferences.notifyTime || '30 Minutes'
        const alert = this.dispatchAlert({
          journeyId,
          trainNo,
          trainName,
          alertType: ALERT_TYPES.DESTINATION_APPROACHING,
          message: `Your destination ${currentJourneyState.toName || currentJourneyState.to} is approaching (~${notifyTimeText}). Please prepare to get down.`,
          triggerCondition: `Within destination proximity (${currentJourneyState.distanceRemaining} km remaining)`,
          severity: ALERT_SEVERITY.INFO,
          stateSignature: `approaching_${currentJourneyState.to}`,
          preferences: alertPreferences,
        })
        if (alert) {
          tracking.approachingNotified = true
          generatedAlerts.push(alert)
        }
      }
    }

    // 4. DELAY EVALUATION (DELAY_DETECTED & DELAY_INCREASED)
    const currentDelay = typeof currentJourneyState.delayMinutes === 'number' ? currentJourneyState.delayMinutes : 0
    const lastDelay = tracking.lastDelayNotified

    if (currentDelay >= DELAY_THRESHOLD_MINUTES) {
      if (lastDelay < DELAY_THRESHOLD_MINUTES) {
        // DELAY DETECTED: First time meaningful delay is observed
        const severity = currentDelay >= CRITICAL_DELAY_MINUTES ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.WARNING
        const alert = this.dispatchAlert({
          journeyId,
          trainNo,
          trainName,
          alertType: ALERT_TYPES.DELAY_DETECTED,
          message: `${trainName} is currently delayed by ${currentDelay} minutes.`,
          triggerCondition: `Delay reached ${currentDelay}m (threshold >= ${DELAY_THRESHOLD_MINUTES}m)`,
          severity,
          stateSignature: `delay_${currentDelay}m`,
          preferences: alertPreferences,
        })
        if (alert) {
          tracking.lastDelayNotified = currentDelay
          generatedAlerts.push(alert)
        }
      } else if (currentDelay >= lastDelay + DELAY_THRESHOLD_MINUTES) {
        // DELAY INCREASED: Delay worsened by at least DELAY_THRESHOLD_MINUTES (e.g., 10m -> 20m)
        const severity = currentDelay >= CRITICAL_DELAY_MINUTES ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.WARNING
        const alert = this.dispatchAlert({
          journeyId,
          trainNo,
          trainName,
          alertType: ALERT_TYPES.DELAY_INCREASED,
          message: `${trainName} delay increased to ${currentDelay} minutes (previously ${lastDelay} minutes).`,
          triggerCondition: `Delay increased from ${lastDelay}m to ${currentDelay}m`,
          severity,
          stateSignature: `delay_increase_${lastDelay}_to_${currentDelay}`,
          preferences: alertPreferences,
        })
        if (alert) {
          tracking.lastDelayNotified = currentDelay
          generatedAlerts.push(alert)
        }
      } else {
        console.log(`[AlertEngine] 🛡️ Duplicate alert prevented (Delay unchanged at ${currentDelay}m)`)
      }
    } else if (currentDelay < DELAY_THRESHOLD_MINUTES && lastDelay >= DELAY_THRESHOLD_MINUTES) {
      // Delay cleared / train back on time
      console.log(`[AlertEngine] ℹ️ Delay resolved for train ${trainNo} (Back on time)`)
      tracking.lastDelayNotified = 0
    }

    return generatedAlerts
  }

  /**
   * Initializes evaluation upon journey creation (Confirm & Start Journey)
   */
  evaluateJourneyStart(journeyStore) {
    if (!journeyStore) return null
    return this.evaluateJourneyState(journeyStore)
  }

  /**
   * Handles cleanup when a journey is completed or cancelled
   */
  handleJourneyCompleted(journeyId) {
    if (!journeyId) return
    const tracking = this.journeyStates.get(journeyId)
    if (tracking) {
      tracking.arrivalNotified = true
    }
    console.log(`[AlertEngine] 🛑 Alert evaluation concluded for journey ${journeyId}`)
  }

  /**
   * Resets internal evaluator state (useful for tests or full journey purge)
   */
  resetState(journeyId = null) {
    if (journeyId) {
      this.journeyStates.delete(journeyId)
      // Clear sent alert keys for this journey
      const keysToDelete = Array.from(this.sentAlertKeys).filter((k) => k.startsWith(`${journeyId}_`))
      keysToDelete.forEach((k) => this.sentAlertKeys.delete(k))
    } else {
      this.journeyStates.clear()
      this.sentAlertKeys.clear()
    }
  }

  /**
   * Subscribes reactive components to alert history changes
   */
  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Notifies subscribers of alert history changes
   */
  notifyListeners(history, newAlert = null) {
    this.listeners.forEach((cb) => {
      try {
        cb(history, newAlert)
      } catch (err) {
        console.error('[AlertEngine] Listener error:', err.message)
      }
    })
  }
}

export const alertEvaluationEngine = new AlertEvaluationEngineManager()
