/**
 * Unified RailRadar API Service Layer Entrypoint
 * Provides modular, scalable access to all 17 documented RailRadar API endpoints.
 */

export { default as executeRailRequest, rawRailFetch } from './client.js'
export { RAIL_API_CONFIG, ENDPOINTS } from './constants.js'
export { railCache } from './cache.js'
export * from './errors.js'
export * from './helpers.js'

// Module 1: Trains
export * from './trainsService.js'

// Module 2: Station Boards
export * from './stationsService.js'

// Module 3: Fast Lookups
export * from './lookupsService.js'

// Module 4: Legacy Support
export * from './legacyService.js'
