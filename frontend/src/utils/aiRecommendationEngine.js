// Helper to convert 12-hour AM/PM time strings to total 24-hour minutes
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3].toUpperCase()

  if (period === 'PM' && hours < 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  return hours * 60 + minutes
}

// Get current system time (IST / local time)
export const getCurrentIndianTime = () => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 === 0 ? 12 : hours % 12
  const formattedTime = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
  const totalMinutes = hours * 60 + minutes

  return { totalMinutes, formattedTime }
}

/**
 * Calculates dynamic AI Recommendations based on Current Indian Time,
 * departure timings, travel duration, running status, and departed state.
 *
 * Future-ready for live API integration (delays, platform status, live running info).
 */
export const calculateAiRecommendations = (trains, selectedDate, dateMode = 'TODAY', overrideCurrentMins = null) => {
  if (!trains || trains.length === 0) return { recommendations: [], currentTimeFormatted: '' }

  const { totalMinutes: currentMins, formattedTime } = getCurrentIndianTime()
  const effectiveCurrentMins = overrideCurrentMins !== null ? overrideCurrentMins : currentMins

  // Day of week calculation for selected date
  const selectedDayIndex = selectedDate
    ? new Date(selectedDate + 'T00:00:00').getDay()
    : new Date().getDay()
  const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const selectedDayName = weekDayNames[selectedDayIndex]

  // Filter trains that operate on selected date
  let eligible = trains.filter((t) => t.runsDaily || t.runningDays?.includes(selectedDayName))

  if (eligible.length === 0) return { recommendations: [], currentTimeFormatted: formattedTime }

  // If dateMode is TODAY, filter out trains that have already departed
  if (dateMode === 'TODAY') {
    const upcoming = eligible.filter((t) => {
      const depMins = timeToMinutes(t.departureTime)
      return depMins >= effectiveCurrentMins
    })

    // If there are upcoming trains today, use upcoming trains; otherwise fallback to earliest services
    if (upcoming.length > 0) {
      eligible = upcoming
    }
  }

  // Sort upcoming eligible trains chronologically by departure time
  eligible.sort((a, b) => timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime))

  const recommendations = []

  if (eligible.length > 0) {
    const topPick = eligible[0]
    const reason = 'Leaves soon and provides one of the quickest journeys.'

    recommendations.push({
      train: topPick,
      type: 'PRIMARY',
      badgeText: '⭐ AI Recommended',
      reason: reason,
    })
  }

  if (eligible.length > 1) {
    const remaining = eligible.slice(1)
    // Find the train with the shortest journey duration among remaining upcoming trains
    const fastestAlt = remaining.reduce((fastest, curr) => {
      return curr.durationMinutes < fastest.durationMinutes ? curr : fastest
    }, remaining[0])

    const altReason = 'Fastest journey after the recommended option.'

    recommendations.push({
      train: fastestAlt,
      type: 'ALTERNATIVE',
      badgeText: '⭐ Alternative',
      reason: altReason,
    })
  }

  return {
    recommendations: recommendations.slice(0, 2),
    currentTimeFormatted: formattedTime,
  }
}
