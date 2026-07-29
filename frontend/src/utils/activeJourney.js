/**
 * Helper utility for Active Journey state management.
 * Abstracts storage access so future backend API calls can seamlessly replace localStorage.
 */

const STORAGE_KEY = 'railalert_active_journey'

/**
 * Gets the current active journey object or null
 * @returns {object|null}
 */
export function getActiveJourney() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Saves an active journey with user alert preferences
 * @param {object} journeyData
 * @returns {boolean}
 */
export function saveActiveJourney(journeyData) {
  try {
    const payload = {
      ...journeyData,
      activatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

/**
 * Cancels/removes the current active journey
 * @returns {boolean}
 */
export function cancelActiveJourney() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

/**
 * Checks whether an active journey is currently present
 * @returns {boolean}
 */
export function hasActiveJourney() {
  return Boolean(getActiveJourney())
}
