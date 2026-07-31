/**
 * Live Journey Tracking Engine (Single Source of Truth)
 * Interfaces between RailRadar Live API responses and React Journey Store / Components.
 * Normalizes raw upstream payloads into a unified live tracking state object.
 */

/**
 * Converts 24-hour time, ISO timestamp string, or Date object into 12-hour AM/PM format
 */
export function formatTime12(timeInput) {
  if (!timeInput) return '--:--'
  let dateObj = null
  if (timeInput instanceof Date) {
    dateObj = timeInput
  } else if (typeof timeInput === 'string' && timeInput.includes('T')) {
    dateObj = new Date(timeInput)
  } else if (typeof timeInput === 'string' && timeInput.includes(':')) {
    const parts = timeInput.split(':')
    const h = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    if (!isNaN(h) && !isNaN(m)) {
      dateObj = new Date()
      dateObj.setHours(h, m, 0, 0)
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return String(timeInput)
  }

  let hours = dateObj.getHours()
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const period = hours >= 12 ? 'PM' : 'AM'
  if (hours > 12) hours -= 12
  if (hours === 0) hours = 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`
}

/**
 * Derives expected arrival/departure time from scheduled time and delay minutes
 */
export function getExpectedTime(scheduledStr, actualStr, delayMins = 0) {
  if (actualStr) return formatTime12(actualStr)
  if (!scheduledStr) return '--:--'
  if (!delayMins || delayMins <= 0) return formatTime12(scheduledStr)

  let dateObj = null
  if (typeof scheduledStr === 'string' && scheduledStr.includes('T')) {
    dateObj = new Date(scheduledStr)
  } else if (typeof scheduledStr === 'string' && scheduledStr.includes(':')) {
    const parts = scheduledStr.split(':')
    const h = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    if (!isNaN(h) && !isNaN(m)) {
      dateObj = new Date()
      dateObj.setHours(h, m, 0, 0)
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return formatTime12(scheduledStr)
  }

  const expectedDate = new Date(dateObj.getTime() + delayMins * 60000)
  return formatTime12(expectedDate)
}

/**
 * Derives user-friendly running status description from live payload
 */
function deriveRunningStatus(status, delayMinutes) {
  if (status === 'completed') return 'Journey Completed'
  if (status === 'not-started') return 'Not Started Yet'
  if (delayMinutes > 0) return `Delayed by ${delayMinutes} Mins`
  return 'Running On Time'
}

/**
 * Main Pure Processing Engine Function
 * Takes raw RailRadar live status payload and maps it to standardized live journey state
 */
export function buildLiveJourneyState(rawLivePayload, userJourneyMeta = {}) {
  if (!rawLivePayload) {
    return null
  }

  const data = rawLivePayload.data || rawLivePayload
  const trainInfo = data.train || {}
  const trainNo = String(data.trainNumber || trainInfo.number || userJourneyMeta.trainNo || '20608')
  const trainName = data.trainName || trainInfo.name || userJourneyMeta.trainName || 'VANDE BHARAT EXP'
  const category = trainInfo.category || trainInfo.type || userJourneyMeta.category || 'Superfast'

  const overallStatus = data.status || 'running'
  const delayMinutes = typeof data.delayMinutes === 'number' ? data.delayMinutes : 0
  const lastUpdated = data.lastUpdatedAt || new Date().toISOString()

  const rawRoute = Array.isArray(data.route) ? data.route : []
  const haltStops = rawRoute.filter((s) => s.isHalt || s.isHalt === undefined)

  // Determine current, next, and previous stations
  const currLoc = data.currentLocation || {}
  const nextHaltObj = data.nextHalt || {}

  let currentStationCode = currLoc.stationCode || ''
  let currentSeq = currLoc.sequence || 1

  // Find matching station in route
  let currentRouteItem = rawRoute.find((s) => s.stationCode === currentStationCode || s.sequence === currentSeq)
  if (!currentRouteItem && rawRoute.length > 0) {
    currentRouteItem = rawRoute[0]
  }

  const currentStation = {
    code: currentRouteItem?.stationCode || currLoc.stationCode || trainInfo.source?.code || userJourneyMeta.from || 'MYS',
    name: currentRouteItem?.stationName || trainInfo.source?.name || userJourneyMeta.from || 'MYSORE JN',
    status: currentRouteItem?.status || currLoc.status || 'at-station',
    departureTime: formatTime12(currentRouteItem?.actualDeparture || currentRouteItem?.scheduledDeparture),
  }

  let nextRouteItem = rawRoute.find((s) => s.stationCode === nextHaltObj.stationCode || (s.sequence > currentSeq && s.isHalt))
  if (!nextRouteItem && haltStops.length > 1) {
    nextRouteItem = haltStops[haltStops.length - 1]
  }

  const nextStation = {
    code: nextRouteItem?.stationCode || nextHaltObj.stationCode || trainInfo.destination?.code || userJourneyMeta.to || 'SBC',
    name: nextRouteItem?.stationName || nextHaltObj.stationName || trainInfo.destination?.name || userJourneyMeta.to || 'KSR BENGALURU',
    distance: nextHaltObj.distance ? `${nextHaltObj.distance} km` : '12 km',
    arrivalTime: formatTime12(nextRouteItem?.actualArrival || nextRouteItem?.scheduledArrival),
    platform: nextRouteItem?.platform ? `PF ${nextRouteItem.platform}` : 'PF 1',
  }

  let prevRouteItem = rawRoute.filter((s) => s.sequence < currentSeq && s.isHalt).pop()
  const previousStation = {
    code: prevRouteItem?.stationCode || trainInfo.source?.code || 'MYS',
    name: prevRouteItem?.stationName || trainInfo.source?.name || 'MYSORE JN',
    status: 'departed',
  }

  // Calculate distance & progress
  const totalDistance = trainInfo.distance || (rawRoute.length > 0 ? rawRoute[rawRoute.length - 1].distance : 140) || 140
  const distanceCovered = currentRouteItem?.distance || (currLoc.segmentProgress ? totalDistance * currLoc.segmentProgress : 0) || 0
  const distanceRemaining = Math.max(0, Math.round((totalDistance - distanceCovered) * 10) / 10)

  let journeyPercentage = 0
  if (totalDistance > 0) {
    journeyPercentage = Math.min(100, Math.max(0, Math.round((distanceCovered / totalDistance) * 100)))
  } else if (rawRoute.length > 0) {
    journeyPercentage = Math.min(100, Math.max(0, Math.round((currentSeq / rawRoute.length) * 100)))
  }

  if (overallStatus === 'completed') {
    journeyPercentage = 100
  }

  // Enrich stops list for timeline components with distinct scheduled and actual/expected times
  const stops = (haltStops.length > 0 ? haltStops : rawRoute).map((s, idx) => {
    let stopStatus = 'upcoming'
    if (s.sequence < currentSeq || s.status === 'departed') {
      stopStatus = 'departed'
    } else if (s.sequence === currentSeq || s.stationCode === currentStation.code) {
      stopStatus = 'current'
    }

    const stationDelayArr = typeof s.delayArrival === 'number' ? s.delayArrival : delayMinutes
    const stationDelayDep = typeof s.delayDeparture === 'number' ? s.delayDeparture : delayMinutes

    const schArr = s.scheduledArrival ? formatTime12(s.scheduledArrival) : '--'
    const actArr = getExpectedTime(s.scheduledArrival, s.actualArrival, stationDelayArr)

    const schDep = s.scheduledDeparture ? formatTime12(s.scheduledDeparture) : '--'
    const actDep = getExpectedTime(s.scheduledDeparture, s.actualDeparture, stationDelayDep)

    return {
      sequence: s.sequence || idx + 1,
      code: s.stationCode || `ST${idx}`,
      name: s.stationName || `Station ${idx + 1}`,
      schArr,
      actArr,
      schDep,
      actDep,
      arrivalTime: actArr !== '--' ? actArr : schArr,
      departureTime: actDep !== '--' ? actDep : schDep,
      haltMinutes: s.haltMinutes || 2,
      platform: s.platform ? `PF ${s.platform}` : 'PF 1',
      distance: s.distance || 0,
      status: stopStatus,
      delayMinutes: stationDelayDep || stationDelayArr || 0,
    }
  })

  return {
    journeyId: userJourneyMeta.journeyId || `journey_${trainNo}_${Date.now()}`,
    trainNo,
    trainName,
    category,
    from: userJourneyMeta.from || trainInfo.source?.code || 'MYS',
    to: userJourneyMeta.to || trainInfo.destination?.code || 'SBC',
    fromName: trainInfo.source?.name || userJourneyMeta.from || 'MYSORE JN',
    toName: trainInfo.destination?.name || userJourneyMeta.to || 'KSR BENGALURU',
    currentStation,
    nextStation,
    previousStation,
    delayMinutes,
    expectedArrival: nextStation.arrivalTime,
    journeyPercentage,
    distanceCovered: Math.round(distanceCovered * 10) / 10,
    distanceRemaining,
    totalDistance,
    runningStatus: deriveRunningStatus(overallStatus, delayMinutes),
    platform: nextStation.platform,
    lastUpdated,
    apiHealth: 'OK',
    journeyStatus: overallStatus === 'completed' ? 'Completed' : (userJourneyMeta.journeyStatus || 'Active'),
    stops,
  }
}
