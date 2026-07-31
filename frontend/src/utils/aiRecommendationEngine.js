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
 * Formats minute difference into human readable text (e.g. 18 -> "18 minutes", 120 -> "2 hours")
 */
function formatMinutesDifference(diffMins) {
  if (diffMins <= 0) return 'shortly'
  if (diffMins < 60) return `in ${diffMins} minutes`
  const hrs = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  if (mins === 0) return `in ${hrs} hour${hrs > 1 ? 's' : ''}`
  return `in ${hrs}h ${mins}m`
}

/**
 * Calculates dynamic time-aware AI Recommendations based on current time.
 * Prioritizes next available departure, lowest waiting time, and fastest duration.
 */
export const calculateAiRecommendations = (trains, selectedDate, dateMode = 'TODAY', overrideCurrentMins = null) => {
  if (!trains || trains.length === 0) return { recommendations: [], currentTimeFormatted: '' }

  const { totalMinutes: currentMins, formattedTime } = getCurrentIndianTime()
  const effectiveCurrentMins = overrideCurrentMins !== null ? overrideCurrentMins : currentMins

  const selectedDayIndex = selectedDate
    ? new Date(selectedDate + 'T00:00:00').getDay()
    : new Date().getDay()
  const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const selectedDayName = weekDayNames[selectedDayIndex]

  // Filter trains that operate on selected date
  let eligible = trains.filter((t) => t.runsDaily || t.runningDays?.includes(selectedDayName))

  if (eligible.length === 0) return { recommendations: [], currentTimeFormatted: formattedTime }

  // If searching for TODAY, filter out trains that departed already
  if (dateMode === 'TODAY') {
    const upcoming = eligible.filter((t) => {
      const depMins = timeToMinutes(t.departureTime)
      return depMins >= effectiveCurrentMins
    })

    if (upcoming.length > 0) {
      eligible = upcoming
    }
  }

  // Sort upcoming trains by departure time from current time (Priority 1 & 2)
  eligible.sort((a, b) => {
    const depA = timeToMinutes(a.departureTime)
    const depB = timeToMinutes(b.departureTime)
    const waitA = depA >= effectiveCurrentMins ? depA - effectiveCurrentMins : depA + 1440 - effectiveCurrentMins
    const waitB = depB >= effectiveCurrentMins ? depB - effectiveCurrentMins : depB + 1440 - effectiveCurrentMins

    // If wait times are within 15 mins of each other, prioritize faster duration (Priority 3)
    if (Math.abs(waitA - waitB) <= 15) {
      return a.durationMinutes - b.durationMinutes
    }
    return waitA - waitB
  })

  const recommendations = []

  if (eligible.length > 0) {
    const topPick = eligible[0]
    const depMins = timeToMinutes(topPick.departureTime)
    const waitMins = depMins >= effectiveCurrentMins ? depMins - effectiveCurrentMins : depMins + 1440 - effectiveCurrentMins
    const waitStr = formatMinutesDifference(waitMins)
    const toStationName = topPick.to ? topPick.to.split('(')[0].trim() : 'destination'

    const reason = `Leaves ${waitStr} and reaches ${toStationName} in approximately ${topPick.duration || '2 hours'}.`

    recommendations.push({
      train: topPick,
      type: 'PRIMARY',
      badgeText: '⭐ AI Recommendation',
      reason: reason,
    })
  }

  if (eligible.length > 1) {
    const remaining = eligible.slice(1)
    const altPick = remaining[0]
    const depMins = timeToMinutes(altPick.departureTime)
    const waitMins = depMins >= effectiveCurrentMins ? depMins - effectiveCurrentMins : depMins + 1440 - effectiveCurrentMins
    const waitStr = formatMinutesDifference(waitMins)
    const toStationName = altPick.to ? altPick.to.split('(')[0].trim() : 'destination'

    const altReason = `Leaves ${waitStr} and reaches ${toStationName} in approximately ${altPick.duration || '2 hours'}.`

    recommendations.push({
      train: altPick,
      type: 'ALTERNATIVE',
      badgeText: '⭐ Alternative Pick',
      reason: altReason,
    })
  }

  return {
    recommendations: recommendations.slice(0, 2),
    currentTimeFormatted: formattedTime,
  }
}
