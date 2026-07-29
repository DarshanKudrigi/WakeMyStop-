/**
 * TypeScript / JSDoc Data Contract Models for RailRadar API
 * Matching exact schemas from RailRadar Developer API Reference Guide v1.0
 *
 * @module railApi/types
 */

/**
 * @typedef {Object} RailApiMeta
 * @property {string} traceId - Unique UUID trace ID for request debugging
 * @property {string} timestamp - ISO timestamp in IST (+05:30)
 * @property {number} executionTime - Server execution time in milliseconds
 * @property {'database'|'hybrid'|'external'} source - Data source tier (database=fast/cached, external=upstream/slow)
 */

/**
 * @template T
 * @typedef {Object} RailApiEnvelope
 * @property {boolean} success - True if request succeeded, false on error
 * @property {T} data - Endpoint response payload
 * @property {RailApiMeta} meta - Metadata about execution
 */

/**
 * @typedef {Object} RailApiErrorBody
 * @property {string} code - Error code string (VALIDATION_ERROR, NOT_FOUND, RATE_LIMIT_EXCEEDED, etc.)
 * @property {string} message - Human-readable error description
 * @property {string} [details] - Detailed error context or field validation message
 */

/**
 * @typedef {Object} RailApiErrorEnvelope
 * @property {false} success - Always false for errors
 * @property {RailApiErrorBody} error - Error descriptor
 * @property {RailApiMeta} meta - Metadata
 */

/**
 * @typedef {Object} StationRef
 * @property {string} code - Station code (e.g. "MYS", "SBC", "INDB")
 * @property {string} name - Station full name (e.g. "Mysuru Junction")
 */

/**
 * @typedef {Object} TrainInfo
 * @property {string} number - 5-digit train number (e.g. "12919")
 * @property {string} name - Train name (e.g. "Malwa SF Express")
 * @property {string} type - Train type (e.g. "Superfast Express", "Vande Bharat")
 * @property {string} category - Train category (e.g. "Superfast", "Express", "Local")
 * @property {StationRef} source - Source station details
 * @property {StationRef} destination - Destination station details
 * @property {Array<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'>} runDays - Days of week train runs
 * @property {number} distance - Total journey distance in kilometers
 * @property {number} duration - Total scheduled journey duration in minutes
 * @property {number} [avgSpeed] - Average speed in km/h
 * @property {number} [maxSpeed] - Maximum speed in km/h
 * @property {number} totalHalts - Total count of official halts
 * @property {string} [returnTrain] - Train number for return journey
 * @property {string} [coachPosition] - Physical coach sequence from engine backwards
 */

/**
 * @typedef {Object} RouteStop
 * @property {number} sequence - Stop sequence order (1-indexed)
 * @property {StationRef} station - Station code and name
 * @property {string|null} arrival - Scheduled arrival time (HH:MM or null for origin)
 * @property {string|null} departure - Scheduled departure time (HH:MM or null for destination)
 * @property {number} arrivalDay - Journey day number for arrival (Day 1, Day 2...)
 * @property {number} departureDay - Journey day number for departure
 * @property {number} distance - Cumulative distance from source in km
 * @property {boolean} isHalt - True if official halt, false if pass-through station
 * @property {string} [platform] - Assigned platform number
 * @property {number} [speedToNextStationKmph] - Speed to next stop in km/h
 */

/**
 * @typedef {Object} TrainDetailsData
 * @property {TrainInfo} train - Train overview payload
 * @property {RouteStop[]} route - Full station-by-station schedule
 */

/**
 * @typedef {Object} LiveCurrentLocation
 * @property {string} stationCode - Code of current/last station
 * @property {number} sequence - Sequence index in route
 * @property {'departed'|'arrived'|'running'} status - Station status
 * @property {boolean} isHalt - True if current station is official halt
 * @property {boolean} isDiverted - True if diverted onto alternate route
 * @property {boolean} isActualPosition - True if GPS-validated position, false if estimated
 * @property {number} segmentProgress - Decimal 0.0 to 1.0 showing progress between stops
 * @property {number} [speedKmh] - Current train speed in km/h
 * @property {number} [bearingDegrees] - Current heading angle in degrees (0-360)
 */

/**
 * @typedef {Object} LiveException
 * @property {'DIVERTED'|'RESCHEDULED'|'CANCELLED'} type - Exception type
 * @property {string} message - Human readable exception alert
 * @property {object} [diverted] - Diversion details (from, to, divertedStations)
 */

/**
 * @typedef {Object} LiveTrainStatusData
 * @property {string} trainNumber - 5-digit train number
 * @property {string} trainName - Train name
 * @property {string} startDate - Journey date (YYYY-MM-DD)
 * @property {string} lastUpdatedAt - ISO timestamp of last live update
 * @property {'running'|'not-started'|'completed'|'cancelled'} status - Overall train status
 * @property {number} delayMinutes - Overall train delay in minutes
 * @property {LiveCurrentLocation} currentLocation - Current position object
 * @property {{ stationCode: string, stationName: string, sequence: number, distance: number }} [previousHalt]
 * @property {{ stationCode: string, stationName: string, sequence: number, distance: number }} [nextHalt]
 * @property {LiveException[]} exceptions - Array of unusual route events
 * @property {Array<RouteStop & { delayArrival?: number, delayDeparture?: number }>} route - Live schedule per station
 * @property {boolean} isLive - True if live tracking is active
 */

/**
 * @typedef {Object} RouteGeometryData
 * @property {string} trainNumber - 5-digit train number
 * @property {'geojson'|'polyline'|'coordinates'} format - Geometry format
 * @property {object} [geojson] - GeoJSON LineString feature
 * @property {string} [polyline] - Google encoded polyline string
 * @property {Array<[number, number]>} [coordinates] - Array of [lat, lng] pairs
 * @property {Array<{ sequence: number, code: string, name: string, lat: number, lng: number }>} [stops]
 */

/**
 * @typedef {Object} TrainsBetweenData
 * @property {StationRef} from - Source station
 * @property {StationRef} to - Destination station
 * @property {number} count - Total trains count
 * @property {Array<{
 *   train: { number: string, name: string, type: string, runDays: string[] },
 *   from: { departure: string, day: number, sequence: number },
 *   to: { arrival: string, day: number, sequence: number },
 *   distance: number,
 *   duration: number,
 *   totalHaltsBetween: number,
 *   live?: { type: string, startDate: string, expectedArrivalTime?: string, platform?: string, delayMinutes: number }
 * }>} trains - Array of matching train items
 */

/**
 * @typedef {Object} StationBoardData
 * @property {StationRef} station - Station details
 * @property {number} count - Total train count
 * @property {boolean} includeIntermediate - Whether intermediate trains are included
 * @property {Array<{
 *   train: { number: string, name: string, type: string, source: StationRef, destination: StationRef, runDays: string[] },
 *   stop: { sequence: number, arrival: string|null, departure: string|null, arrivalDay: number, departureDay: number, distance: number, stopType: 'origin'|'halt'|'destination' }
 * }>} trains
 */

/**
 * @typedef {Object} StationLiveBoardData
 * @property {StationRef} station - Station details
 * @property {{ from: string, to: string, hoursBack: number, hoursAhead: number }} window - Time window
 * @property {number} count - Total trains count
 * @property {Array<{
 *   train: { number: string, name: string, type: string, source: string, destination: string, runDays: string[] },
 *   stop: { sequence: number, arrival: string|null, departure: string|null, day: number, distance: number },
 *   live: { type: 'at-station'|'upcoming'|'departed'|'scheduled', expectedDepartureTime?: string, platform?: string, delayMinutes: number }
 * }>} trains
 */

/**
 * Flat map of Train Number -> Train Name
 * @typedef {Record<string, string>} TrainLookupMap
 */

/**
 * Flat map of Station Code -> Station Name
 * @typedef {Record<string, string>} StationLookupMap
 */
