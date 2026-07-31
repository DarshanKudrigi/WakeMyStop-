/**
 * Centralized Reusable Timezone-Aware Date Utilities
 */

/**
 * Returns user's current local date string in YYYY-MM-DD format (timezone aware)
 * Prevents UTC shift bugs caused by new Date().toISOString()
 */
export function getLocalTodayDateStr() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formats a YYYY-MM-DD date string into a user-friendly local date string
 * Example: "2026-08-01" -> "Saturday, 1 Aug 2026"
 */
export function formatLocalDateDisplay(dateStr, includeWeekday = true) {
  if (!dateStr) return ''
  const parts = String(dateStr).split('-').map(Number)
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return dateStr
  }

  const [year, month, day] = parts
  const localDate = new Date(year, month - 1, day) // Local time constructor

  return localDate.toLocaleDateString('en-US', {
    ...(includeWeekday ? { weekday: 'short' } : {}),
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
