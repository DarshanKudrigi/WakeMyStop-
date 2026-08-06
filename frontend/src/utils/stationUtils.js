/**
 * Utility helper to extract clean station code from search strings
 * e.g. "KSR BENGALURU (SBC)" -> "SBC"
 * e.g. "MYSURU JN (MYS)" -> "MYS"
 * e.g. "SBC" -> "SBC"
 */
export function extractStationCode(input) {
  if (!input) return ''
  if (typeof input !== 'string') return String(input)
  const match = input.match(/\(([^)]+)\)/)
  if (match && match[1]) return match[1].trim()
  return input.trim()
}

/**
 * Flexible station matcher supporting station codes, full station names, and city alias strings
 */
export function matchesStation(s, searchInput) {
  if (!s || !searchInput) return false
  const rawTarget = String(searchInput).trim().toUpperCase()
  const extractedCode = extractStationCode(searchInput).toUpperCase()

  const stCode = (s.stationCode || s.station?.code || s.code || '').trim().toUpperCase()
  const stName = (s.stationName || s.station?.name || s.name || '').trim().toUpperCase()

  // 1. Exact Station Code Match (e.g. "SBC" === "SBC", "MYS" === "MYS")
  if (stCode && (stCode === extractedCode || stCode === rawTarget)) {
    return true
  }

  // 2. Exact Station Name Match
  if (stName && (stName === rawTarget || stName === extractedCode)) {
    return true
  }

  // 3. Cleaned Name Inclusion Match
  if (rawTarget.length >= 3 && stName) {
    const cleanTarget = rawTarget.replace(/\b(JN|JLN|HALT|STATION)\b/g, '').trim()
    const cleanName = stName.replace(/\b(JN|JLN|HALT|STATION)\b/g, '').trim()

    if (cleanTarget.length >= 3 && cleanName.length >= 3) {
      if (cleanName === cleanTarget || cleanName.includes(cleanTarget) || cleanTarget.includes(cleanName)) {
        return true
      }
    }
  }

  return false
}
