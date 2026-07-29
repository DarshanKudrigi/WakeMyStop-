import executeRailRequest from './client.js'
import { ENDPOINTS, RAIL_API_CONFIG } from './constants.js'

/**
 * Service Module 3: Fast Lookup API Wrapper Functions
 * Cached on server and client to power instant search boxes & autocomplete fields.
 */

/**
 * 4.1 Train Lookup (Number → Name)
 * Returns a flat { "12919": "Malwa Express", ... } map for every active train.
 *
 * @param {object} [options]
 * @param {boolean} [options.bypassCache=false]
 * @returns {Promise<import('./types').RailApiEnvelope<import('./types').TrainLookupMap>>}
 */
export async function getTrainLookup(options = {}) {
  return executeRailRequest(
    ENDPOINTS.TRAIN_LOOKUP,
    {},
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.LOOKUPS,
      bypassCache: options.bypassCache,
    }
  )
}

/**
 * 4.2 Station Lookup (Code → Name)
 * Returns a flat { "MYS": "Mysuru Junction", ... } map for every station.
 *
 * @param {object} [options]
 * @param {boolean} [options.bypassCache=false]
 * @returns {Promise<import('./types').RailApiEnvelope<import('./types').StationLookupMap>>}
 */
export async function getStationLookup(options = {}) {
  return executeRailRequest(
    ENDPOINTS.STATION_LOOKUP,
    {},
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.LOOKUPS,
      bypassCache: options.bypassCache,
    }
  )
}
