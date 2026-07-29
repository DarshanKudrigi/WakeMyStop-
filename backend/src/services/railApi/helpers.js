/**
 * Parameter Sanitization & Helper Utilities for RailRadar API Integration
 */

/**
 * Sanitizes and validates a 5-digit Indian Railways train number
 * @param {string|number} trainNumber
 * @returns {string} Standardized 5-digit train number string
 */
export function sanitizeTrainNumber(trainNumber) {
  if (!trainNumber) {
    throw new Error('Train number is required')
  }
  const str = String(trainNumber).trim()
  if (!/^\d{4,5}$/.test(str)) {
    throw new Error(`Invalid train number format: "${trainNumber}". Must be 4-5 numeric digits.`)
  }
  return str.padStart(5, '0')
}

/**
 * Sanitizes and uppercase formats a station code
 * @param {string} code
 * @returns {string} Uppercase station code (e.g. "MYS", "SBC")
 */
export function sanitizeStationCode(code) {
  if (!code) {
    throw new Error('Station code is required')
  }
  const str = String(code).trim().toUpperCase()
  if (!/^[A-Z0-9]{1,10}$/.test(str)) {
    throw new Error(`Invalid station code format: "${code}". Must be 1-10 alphanumeric characters.`)
  }
  return str
}

/**
 * Validates date string in YYYY-MM-DD format
 * @param {string} [dateStr]
 * @returns {string|undefined}
 */
export function sanitizeDate(dateStr) {
  if (!dateStr) return undefined
  const str = String(dateStr).trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    throw new Error(`Invalid date format: "${dateStr}". Must be YYYY-MM-DD.`)
  }
  return str
}

/**
 * Formats delay minutes into user-friendly status badge string
 * @param {number} delayMinutes
 * @returns {string} Status string (e.g. "Running On Time", "Delayed by 12 Mins")
 */
export function formatDelayStatus(delayMinutes = 0) {
  if (!delayMinutes || delayMinutes <= 0) {
    return 'Running On Time'
  }
  return `Delayed by ${delayMinutes} Mins`
}

/**
 * Converts decimal segment progress (0.0 to 1.0) into completion percentage
 * @param {number} segmentProgress
 * @returns {number} Percentage from 0 to 100
 */
export function formatCompletionPercentage(segmentProgress = 0) {
  if (typeof segmentProgress !== 'number') return 0
  const pct = Math.round(segmentProgress * 100)
  return Math.min(100, Math.max(0, pct))
}
