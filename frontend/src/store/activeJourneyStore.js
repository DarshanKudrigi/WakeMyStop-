/**
 * Centralized Active Journey Store (Single Source of Truth)
 * Maintains active journey state, last successful live responses, cache expiry, and progress metrics.
 * Every page and component reads from this store.
 */

const ACTIVE_JOURNEY_STORAGE_KEY = 'railalert_active_journey_store'

class ActiveJourneyStoreManager {
  constructor() {
    this.currentStore = this.loadFromStorage()
  }

  /**
   * Loads store payload from localStorage
   */
  loadFromStorage() {
    try {
      const raw = localStorage.getItem(ACTIVE_JOURNEY_STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch (err) {
      console.warn('[ActiveJourneyStore] Failed to load store:', err.message)
      return null
    }
  }

  /**
   * Saves store payload to localStorage
   */
  saveToStorage(data) {
    try {
      if (data) {
        localStorage.setItem(ACTIVE_JOURNEY_STORAGE_KEY, JSON.stringify(data))
      } else {
        localStorage.removeItem(ACTIVE_JOURNEY_STORAGE_KEY)
      }
    } catch (err) {
      console.warn('[ActiveJourneyStore] Failed to save store:', err.message)
    }
  }

  /**
   * Returns current active journey store
   */
  getStore() {
    return this.currentStore
  }

  /**
   * Creates or activates a new journey using cached live data (0 API dispatches)
   */
  createActiveJourney(payload) {
    const now = Date.now()
    const nowIso = new Date(now).toISOString()

    const liveState = payload.liveState || payload.progressData || {}
    const derivedEta = payload.expectedArrival || liveState.expectedArrival || liveState.nextStation?.arrivalTime || liveState.arrivalTime || '--'

    const stopsArray = (Array.isArray(liveState.stops) && liveState.stops.length > 0)
      ? liveState.stops
      : (Array.isArray(payload.stops) && payload.stops.length > 0 ? payload.stops : [])

    const storePayload = {
      ...liveState,
      ...payload,
      journeyId: payload.journeyId || `jrn_${payload.trainNo}_${now}`,
      trainNo: String(payload.trainNo).trim(),
      trainName: payload.trainName || liveState.trainName || 'Train Express',
      from: payload.from || liveState.from || 'MYS',
      to: payload.to || liveState.to || 'SBC',
      journeyDate: payload.journeyDate || payload.date || 'Today',
      alertPreferences: payload.alertPreferences || {},
      journeyStatus: 'Active',
      createdTime: nowIso,
      activatedAt: nowIso,
      lastLiveResponse: payload.lastLiveResponse || liveState || null,
      cacheCreatedTime: payload.cacheCreatedTime || now,
      cacheExpiryTime: payload.cacheExpiryTime || (now + 3.5 * 60 * 1000),
      lastSuccessfulUpdate: nowIso,
      expectedArrival: derivedEta,
      runningStatus: liveState.runningStatus || payload.status || 'Running On Time',
      delayMinutes: typeof liveState.delayMinutes === 'number' ? liveState.delayMinutes : (payload.delayMinutes || 0),
      currentStation: liveState.currentStation || payload.currentStation || { code: payload.from, name: payload.from, status: 'at-station' },
      nextStation: liveState.nextStation || payload.nextStation || { code: payload.to, name: payload.to, distance: '12 km' },
      previousStation: liveState.previousStation || payload.previousStation || { code: payload.from, name: payload.from, status: 'departed' },
      journeyPercentage: typeof liveState.journeyPercentage === 'number' ? liveState.journeyPercentage : (payload.journeyPercentage || 0),
      distanceCovered: typeof liveState.distanceCovered === 'number' ? liveState.distanceCovered : (payload.distanceCovered || 0),
      distanceRemaining: typeof liveState.distanceRemaining === 'number' ? liveState.distanceRemaining : (payload.distanceRemaining || 138),
      totalDistance: liveState.totalDistance || payload.totalDistance || 138,
      stops: stopsArray,
      progressData: liveState,
    }

    this.currentStore = storePayload
    this.saveToStorage(storePayload)

    console.log(`[ActiveJourneyStore] 🟢 Activated Journey for train ${storePayload.trainNo} (ETA: ${derivedEta}, Stops: ${stopsArray.length})`)
    return storePayload
  }

  /**
   * Updates existing active journey store metrics without overwriting metadata
   */
  updateProgress(updatedLiveState, rawResponse = null) {
    if (!this.currentStore) return null
    const now = Date.now()
    const nowIso = new Date(now).toISOString()

    const derivedEta = updatedLiveState?.expectedArrival || updatedLiveState?.nextStation?.arrivalTime || this.currentStore.expectedArrival || '--'
    const stopsArray = (Array.isArray(updatedLiveState?.stops) && updatedLiveState.stops.length > 0)
      ? updatedLiveState.stops
      : this.currentStore.stops || []

    const updated = {
      ...this.currentStore,
      ...updatedLiveState,
      lastLiveResponse: rawResponse || this.currentStore.lastLiveResponse,
      lastSuccessfulUpdate: nowIso,
      cacheCreatedTime: now,
      cacheExpiryTime: now + 3.5 * 60 * 1000,
      expectedArrival: derivedEta,
      runningStatus: updatedLiveState?.runningStatus || this.currentStore.runningStatus,
      delayMinutes: typeof updatedLiveState?.delayMinutes === 'number' ? updatedLiveState.delayMinutes : this.currentStore.delayMinutes,
      currentStation: updatedLiveState?.currentStation || this.currentStore.currentStation,
      nextStation: updatedLiveState?.nextStation || this.currentStore.nextStation,
      previousStation: updatedLiveState?.previousStation || this.currentStore.previousStation,
      journeyPercentage: typeof updatedLiveState?.journeyPercentage === 'number' ? updatedLiveState.journeyPercentage : this.currentStore.journeyPercentage,
      distanceCovered: typeof updatedLiveState?.distanceCovered === 'number' ? updatedLiveState.distanceCovered : this.currentStore.distanceCovered,
      distanceRemaining: typeof updatedLiveState?.distanceRemaining === 'number' ? updatedLiveState.distanceRemaining : this.currentStore.distanceRemaining,
      totalDistance: updatedLiveState?.totalDistance || this.currentStore.totalDistance,
      stops: stopsArray,
      progressData: updatedLiveState || this.currentStore.progressData,
    }

    this.currentStore = updated
    this.saveToStorage(updated)
    return updated
  }

  /**
   * Cancels active journey
   */
  cancelJourney() {
    this.currentStore = null
    this.saveToStorage(null)
    console.log('[ActiveJourneyStore] 🔴 Cancelled Active Journey')
    return true
  }

  /**
   * Completes active journey
   */
  completeJourney() {
    if (this.currentStore) {
      this.currentStore.journeyStatus = 'Completed'
    }
    this.cancelJourney()
    return true
  }
}

export const activeJourneyStore = new ActiveJourneyStoreManager()
