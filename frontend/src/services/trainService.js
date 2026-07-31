/**
 * Higher-Level Train & Station Service Layer
 * Interfaces with backend RailRadar API proxy via centralized apiClient.
 * Includes 5-minute in-memory search caching to conserve Railway API credits (50 req/day limit).
 */

import { apiRequest } from './apiService'
import { searchStations } from './stationSearchService'

// 5-Minute In-Memory Search Cache (TTL: 300,000 ms)
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000
const searchCache = new Map()

/**
 * Converts 24-hour time "14:15" to 12-hour AM/PM format "02:15 PM"
 */
function format24to12(timeStr) {
  if (!timeStr) return '07:40 PM'
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr
  const parts = timeStr.split(':')
  if (parts.length < 2) return timeStr
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1]
  const period = hours >= 12 ? 'PM' : 'AM'
  if (hours > 12) hours -= 12
  if (hours === 0) hours = 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`
}

/**
 * Formats duration in minutes (e.g. 160 -> "2h 40m")
 */
function formatDurationMinutes(durationVal) {
  if (!durationVal) return '2h 15m'
  if (typeof durationVal === 'string' && (durationVal.includes('h') || durationVal.includes('m'))) {
    return durationVal
  }
  const mins = parseInt(durationVal, 10)
  if (isNaN(mins)) return '2h 15m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Maps runDays array ["mon", "tue", ...] to UI running days format ["Mon", "Tue", ...]
 */
function formatRunDaysArray(runDaysArr) {
  if (!runDaysArr || !Array.isArray(runDaysArr)) return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const map = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' }
  return runDaysArr.map((d) => map[String(d).toLowerCase()] || String(d))
}

/**
 * Normalizes RailRadar API train object to match UI component contracts
 */
function normalizeTrainData(rawItem) {
  if (!rawItem) return null
  
  // Extract train info object if nested under rawItem.train
  const trainObj = rawItem.train || rawItem
  const fromObj = rawItem.from || {}
  const toObj = rawItem.to || {}

  const trainNo = String(trainObj.number || trainObj.trainNumber || trainObj.trainNo || rawItem.trainNo || '20608')
  const trainName = trainObj.name || trainObj.trainName || rawItem.trainName || 'VANDE BHARAT EXP'
  const category = trainObj.type || trainObj.category || rawItem.category || 'Superfast'

  const depTimeRaw = fromObj.departure || rawItem.departureTime || '07:40 PM'
  const arrTimeRaw = toObj.arrival || rawItem.arrivalTime || '09:55 PM'

  const departureTime = format24to12(depTimeRaw)
  const arrivalTime = format24to12(arrTimeRaw)

  const rawDuration = rawItem.duration || rawItem.durationMinutes || 135
  const duration = formatDurationMinutes(rawDuration)
  const durationMinutes = typeof rawDuration === 'number' ? rawDuration : parseInt(rawDuration, 10) || 135

  const rawDist = rawItem.distance || rawItem.totalDistance || 138
  const distance = typeof rawDist === 'number' ? `${rawDist} km` : String(rawDist)

  const rawRunDays = trainObj.runDays || rawItem.runningDays || []
  const runningDays = formatRunDaysArray(rawRunDays)
  const runsDaily = runningDays.length === 7

  return {
    id: trainNo,
    trainNo,
    trainName,
    category,
    from: fromObj.name || fromObj.code || rawItem.from || 'MYS',
    to: toObj.name || toObj.code || rawItem.to || 'SBC',
    departureTime,
    arrivalTime,
    duration,
    durationMinutes,
    distance,
    status: rawItem.status || 'Running On Time',
    isDelayed: Boolean(rawItem.delayMinutes && rawItem.delayMinutes > 0),
    delayMinutes: rawItem.delayMinutes || 0,
    stops: rawItem.stops || [],
    runsDaily,
    runningDays,
  }
}

/**
 * Intelligent station code resolver
 * Resolves parenthesis "KSR BENGALURU (SBC)" -> "SBC", exact codes "KT" -> "KT", or names "Kumta" -> "KT", "Bengaluru" -> "SBC"
 */
export function extractStationCode(stationStr) {
  if (!stationStr || typeof stationStr !== 'string') return ''
  const trimmed = stationStr.trim()
  if (!trimmed) return ''

  // 1. Check for code in parenthesis e.g. "KSR BENGALURU (SBC)"
  const match = trimmed.match(/\(([^)]+)\)/)
  if (match && match[1]) {
    return match[1].trim().toUpperCase()
  }

  // 2. Check if string is already a valid 2-5 letter station code
  const upper = trimmed.toUpperCase()
  if (/^[A-Z0-9]{2,5}$/.test(upper)) {
    const results = searchStations(upper, 5)
    const exactCode = results.find((s) => s.code === upper)
    if (exactCode) return upper
  }

  // 3. Resolve station name / alias via search engine
  const suggestions = searchStations(trimmed, 1)
  if (suggestions && suggestions.length > 0 && suggestions[0].code) {
    return suggestions[0].code
  }

  return upper
}

/**
 * Searches trains between stations with 5-minute caching and zero-crash fallback
 */
export async function searchTrains(fromStation, toStation, date) {
  const fromCode = extractStationCode(fromStation)
  const toCode = extractStationCode(toStation)
  const queryDate = date || new Date().toISOString().split('T')[0]

  if (import.meta.env.DEV) {
    console.log(`%c[Train Search FRONTEND] 🔍 Input: "${fromStation}" -> "${toStation}" | Resolved: ${fromCode} -> ${toCode} | Date: ${queryDate}`, 'color: #3b82f6; font-weight: bold;')
  }

  const cacheKey = `${fromCode}_${toCode}_${queryDate}`

  // 1. CHECK 5-MINUTE CACHE
  if (searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey)
    if (Date.now() - cached.timestamp < SEARCH_CACHE_TTL_MS) {
      if (import.meta.env.DEV) {
        console.log(`%c[Train Search CACHE] ⚡ Serving cached results for ${cacheKey} (0 API requests)`, 'color: #8b5cf6; font-weight: bold;')
      }
      return {
        trains: cached.data,
        isMockFallback: false,
        isCached: true,
      }
    }
    searchCache.delete(cacheKey)
  }

  // 2. LIVE HTTP API REQUEST VIA BACKEND PROXY
  try {
    const serverResult = await apiRequest(`/trains/between?from=${fromCode}&to=${toCode}&date=${queryDate}`)

    // Extract trains array from nested response payload: serverResult.data.trains OR serverResult.data
    const trainList = Array.isArray(serverResult?.data?.trains)
      ? serverResult.data.trains
      : Array.isArray(serverResult?.data)
      ? serverResult.data
      : []

    if (trainList.length > 0) {
      const normalized = trainList.map(normalizeTrainData).filter(Boolean)

      // Store in 5-minute cache
      searchCache.set(cacheKey, {
        data: normalized,
        isMockFallback: false,
        timestamp: Date.now(),
      })

      if (import.meta.env.DEV) {
        console.log(`%c[Train Search LIVE] 🟢 Returned ${normalized.length} trains from RailRadar API for ${cacheKey}`, 'color: #10b981; font-weight: bold;')
      }

      return {
        trains: normalized,
        isMockFallback: false,
        isCached: false,
      }
    }
  } catch (error) {
    console.warn('[trainService] searchTrains network call failed:', error.message)
  }

  // If live API returns no trains or fails, return empty list
  return {
    trains: [],
    isMockFallback: false,
    isCached: false,
  }
}

/**
 * Retrieves detailed train schedule and halts
 */
export async function getTrainDetails(trainNo) {
  try {
    const serverResult = await apiRequest(`/trains/${trainNo}`)
    if (serverResult && serverResult.data) {
      return serverResult.data
    }
  } catch (error) {
    console.warn('[trainService] getTrainDetails call failed:', error.message)
  }
  return null
}

/**
 * Retrieves real-time live status for active journey tracking (polled every 15s)
 */
export async function getLiveTrainStatus(trainNo) {
  try {
    const serverResult = await apiRequest(`/trains/${trainNo}/live`)
    if (serverResult && serverResult.data) {
      return serverResult
    }
  } catch (error) {
    console.warn('[trainService] getLiveTrainStatus call failed:', error.message)
  }

  return null
}
