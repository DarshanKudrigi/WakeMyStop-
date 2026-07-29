import executeRailRequest from './client.js'
import { ENDPOINTS, RAIL_API_CONFIG } from './constants.js'
import { sanitizeTrainNumber, sanitizeStationCode, sanitizeDate } from './helpers.js'

/**
 * Service Module 4: Legacy Backward-Compatibility API Wrapper Functions
 */

/**
 * 5.1 Get All Station Key-Values (Legacy)
 * Returns station key-value pairs as an array of arrays [["UJN", "Ujjain Junction"], ...]
 */
export async function getLegacyStationKeyValues(options = {}) {
  return executeRailRequest(
    ENDPOINTS.LEGACY_STATIONS_ALL_KVS,
    {},
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.LOOKUPS,
      bypassCache: options.bypassCache,
    }
  )
}

/**
 * 5.2 Get All Train Key-Values (Legacy)
 * Returns train key-value pairs as an array of arrays [["12919", "Malwa Express"], ...]
 */
export async function getLegacyTrainKeyValues(options = {}) {
  return executeRailRequest(
    ENDPOINTS.LEGACY_TRAINS_ALL_KVS,
    {},
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.LOOKUPS,
      bypassCache: options.bypassCache,
    }
  )
}

/**
 * 5.3 Trains Between Stations (Legacy)
 * Uses query parameters 'from' and 'to' instead of path parameters
 */
export async function getLegacyTrainsBetween(fromStation, toStation, options = {}) {
  const from = sanitizeStationCode(fromStation)
  const to = sanitizeStationCode(toStation)

  return executeRailRequest(
    ENDPOINTS.LEGACY_TRAINS_BETWEEN,
    { from, to },
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.TRAINS_BETWEEN_STATIONS,
      bypassCache: options.bypassCache,
    }
  )
}

/**
 * 5.4 Shipping: Find Trains (Legacy)
 * Specialized freight/shipping endpoint searching trains near target lat/lng point within radius.
 */
export async function findShippingTrains(sourceStation, lat, lng, options = {}) {
  const source = sanitizeStationCode(sourceStation)
  const queryParams = {
    source,
    lat: Number(lat),
    lng: Number(lng),
    radius: options.radius || 100,
    minHaltSource: options.minHaltSource || 2,
    minHaltNear: options.minHaltNear || 2,
    limit: options.limit || 50,
  }

  return executeRailRequest(
    ENDPOINTS.LEGACY_SHIPPING_FIND_TRAINS,
    queryParams,
    {
      ttlMs: 30 * 60 * 1000,
      bypassCache: options.bypassCache,
    }
  )
}

/**
 * 5.5 Get Train Details (Legacy)
 * Backward-compatibility endpoint combining static schedule and live data into legacy shape.
 */
export async function getLegacyTrainDetails(trainNumber, options = {}) {
  const number = sanitizeTrainNumber(trainNumber)
  const queryParams = {}

  if (options.journeyDate) queryParams.journeyDate = sanitizeDate(options.journeyDate)
  if (options.dataType) queryParams.dataType = options.dataType // full | static | live
  if (options.dataProvider) queryParams.dataProvider = options.dataProvider // railradar | NTES
  if (options.userId) queryParams.userId = options.userId

  return executeRailRequest(
    ENDPOINTS.LEGACY_TRAIN_DETAILS(number),
    queryParams,
    {
      ttlMs: 2 * 60 * 1000,
      bypassCache: options.bypassCache,
    }
  )
}
