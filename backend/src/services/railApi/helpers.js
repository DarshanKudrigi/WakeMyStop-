/**
 * Parameter Sanitization & Helper Utilities for RailRadar API Integration
 */

function sanitizeTrainNumber(trainNumber) {
  if (!trainNumber) {
    throw new Error('Train number is required')
  }
  const str = String(trainNumber).trim()
  if (!/^\d{4,5}$/.test(str)) {
    throw new Error(`Invalid train number format: "${trainNumber}". Must be 4-5 numeric digits.`)
  }
  return str.padStart(5, '0')
}

function sanitizeStationCode(code) {
  if (!code) {
    throw new Error('Station code is required')
  }
  const str = String(code).trim().toUpperCase()
  if (!/^[A-Z0-9]{1,10}$/.test(str)) {
    throw new Error(`Invalid station code format: "${code}". Must be 1-10 alphanumeric characters.`)
  }
  return str
}

function sanitizeDate(dateStr) {
  if (!dateStr) return undefined
  const str = String(dateStr).trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    throw new Error(`Invalid date format: "${dateStr}". Must be YYYY-MM-DD.`)
  }
  return str
}

function formatDelayStatus(delayMinutes = 0) {
  if (!delayMinutes || delayMinutes <= 0) {
    return 'Running On Time'
  }
  return `Delayed by ${delayMinutes} Mins`
}

function formatCompletionPercentage(segmentProgress = 0) {
  if (typeof segmentProgress !== 'number') return 0
  const pct = Math.round(segmentProgress * 100)
  return Math.min(100, Math.max(0, pct))
}

module.exports = {
  sanitizeTrainNumber,
  sanitizeStationCode,
  sanitizeDate,
  formatDelayStatus,
  formatCompletionPercentage,
}
