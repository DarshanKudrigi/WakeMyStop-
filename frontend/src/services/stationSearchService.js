/**
 * Advanced Intelligent Station Search Engine
 * Features: Single memoized load, 5-Tier Priority Ranking, City Aliases, and Damerau-Levenshtein Typo Tolerance.
 */

import rawStationsData from '../data/stations.json'
import { CITY_ALIASES, getCityAliasInfo } from '../config/cityAliases'

// Memoized Station Index Array
let stationList = null

/**
 * Initializes and caches the station index once
 */
function initializeStationIndex() {
  if (stationList) return stationList

  const rawMap = rawStationsData?.response?.data || rawStationsData || {}
  stationList = []

  Object.entries(rawMap).forEach(([code, name]) => {
    if (typeof name === 'string') {
      const trimmedCode = code.trim().toUpperCase()
      const trimmedName = name.trim().toUpperCase()
      
      // Determine associated alias name if any
      let matchedAliasName = null
      const lowerName = trimmedName.toLowerCase()

      Object.values(CITY_ALIASES).forEach((alias) => {
        if (lowerName.includes(alias.official) || alias.codes.includes(trimmedCode.toLowerCase())) {
          matchedAliasName = alias.aliasName
        }
      })

      stationList.push({
        code: trimmedCode,
        name: trimmedName,
        aliasName: matchedAliasName,
        displayText: matchedAliasName ? `${trimmedName} (${matchedAliasName})` : trimmedName,
        searchCode: trimmedCode.toLowerCase(),
        searchName: lowerName,
      })
    }
  })

  console.log(`[stationSearchService] 🚀 Indexed ${stationList.length} stations with city alias mappings`)
  return stationList
}

/**
 * Fast Damerau-Levenshtein Edit Distance Algorithm
 * Computes transposition, insertion, deletion, and substitution cost.
 */
function getEditDistance(a, b) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > 2) return 99

  const lenA = a.length
  const lenB = b.length
  const d = Array.from({ length: lenA + 1 }, () => new Int32Array(lenB + 1))

  for (let i = 0; i <= lenA; i++) d[i][0] = i
  for (let j = 0; j <= lenB; j++) d[0][j] = j

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      )

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost) // transposition
      }
    }
  }

  return d[lenA][lenB]
}

/**
 * Executes intelligent 5-Tier ranked station search
 * @param {string} rawQuery - Search string
 * @param {number} [limit=10] - Max suggestion results
 */
export function searchStations(rawQuery, limit = 10) {
  if (!rawQuery || typeof rawQuery !== 'string') return []
  const q = rawQuery.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!q) return []

  const index = initializeStationIndex()
  const aliasInfo = getCityAliasInfo(q)

  const tier1ExactCode = []
  const tier2ExactName = []
  const tier3Prefix = []
  const tier4Alias = []
  const tier5Typo = []

  for (let i = 0; i < index.length; i++) {
    const item = index[i]

    // TIER 1: Exact Station Code Match
    if (item.searchCode === q) {
      tier1ExactCode.push(item)
      continue
    }

    // TIER 2: Exact Station Name Match
    if (item.searchName === q) {
      tier2ExactName.push(item)
      continue
    }

    // TIER 3: Prefix Match (Code or Name starts with query)
    if (item.searchCode.startsWith(q) || item.searchName.startsWith(q)) {
      tier3Prefix.push(item)
      continue
    }

    // TIER 4: Alias Match (Query matches a known city alias like Bangalore -> Bengaluru)
    if (aliasInfo) {
      if (
        item.searchName.includes(aliasInfo.official) ||
        aliasInfo.codes.includes(item.searchCode)
      ) {
        tier4Alias.push(item)
        continue
      }
    }

    // Partial Name Contains Match
    if (item.searchName.includes(q)) {
      tier3Prefix.push(item)
      continue
    }

    // TIER 5: Typo / Fuzzy Distance Match (Only for queries >= 4 characters)
    if (q.length >= 4) {
      const words = item.searchName.split(' ')
      let minDistance = 99

      for (let w = 0; w < words.length; w++) {
        const word = words[w]
        if (word.length >= 3) {
          const dist = getEditDistance(q, word)
          if (dist < minDistance) minDistance = dist
        }
      }

      if (minDistance <= 2) {
        tier5Typo.push({ ...item, distance: minDistance })
      }
    }
  }

  // Sort Typo Matches by edit distance
  tier5Typo.sort((a, b) => a.distance - b.distance)

  // Combine tiers in strict 5-Tier Priority Order
  const combined = [
    ...tier1ExactCode,
    ...tier2ExactName,
    ...tier3Prefix,
    ...tier4Alias,
    ...tier5Typo,
  ]

  // Deduplicate and limit to 10 suggestions
  const unique = []
  const seenCodes = new Set()

  for (let i = 0; i < combined.length; i++) {
    const item = combined[i]
    if (!seenCodes.has(item.code)) {
      seenCodes.add(item.code)
      unique.push({
        code: item.code,
        name: item.name,
        aliasName: item.aliasName,
        displayText: item.displayText,
      })
      if (unique.length >= limit) break
    }
  }

  return unique
}
