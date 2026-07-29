/**
 * Journey Progress & Route Analytics Engine
 * Calculates distance, completion percentage, and station progression.
 */

export function calculateJourneyProgress(train, currentStationCode = 'BID') {
  if (!train) {
    return {
      totalDistance: 138,
      distanceCovered: 92,
      remainingDistance: 46,
      percentComplete: 68,
      currentStation: 'BIDADI',
      nextStation: 'HEJJALA',
    }
  }

  const stops = train.stops || []
  if (stops.length === 0) {
    return {
      totalDistance: 138,
      distanceCovered: 92,
      remainingDistance: 46,
      percentComplete: 68,
      currentStation: 'BIDADI',
      nextStation: 'HEJJALA',
    }
  }

  const currentIndex = stops.findIndex(
    (s) => s.code === currentStationCode || s.isCurrent
  )
  const activeIdx = currentIndex >= 0 ? currentIndex : Math.floor(stops.length / 2)
  const currentStop = stops[activeIdx] || stops[0]
  const nextStop = stops[activeIdx + 1] || stops[stops.length - 1]

  const parseDist = (distStr) => {
    if (!distStr) return 0
    return parseFloat(distStr.replace(/[^0-9.]/g, '')) || 0
  }

  const totalDist = parseDist(stops[stops.length - 1]?.distance || '138.0 km')
  const coveredDist = parseDist(currentStop?.distance || '92.0 km')
  const remainingDist = Math.max(0, totalDist - coveredDist)
  const percent = totalDist > 0 ? Math.min(100, Math.round((coveredDist / totalDist) * 100)) : 68

  return {
    totalDistance: `${totalDist} km`,
    distanceCovered: `${coveredDist} km`,
    remainingDistance: `${remainingDist} km`,
    percentComplete: percent,
    currentStation: currentStop?.name || 'BIDADI',
    nextStation: nextStop?.name || 'HEJJALA',
  }
}
