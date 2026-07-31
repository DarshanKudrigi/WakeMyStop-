import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Navigation, Calendar, ArrowUpDown, Train, ArrowRight, History, AlertCircle } from 'lucide-react'
import DatePickerModal from '../common/DatePickerModal'
import { searchStations } from '../../services/stationSearchService'
import { extractStationCode } from '../../services/trainService'
import { getLocalTodayDateStr, formatLocalDateDisplay } from '../../utils/dateUtils'

function TrainSearchCard() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fromStation: 'KSR BENGALURU (SBC)',
    toStation: 'MYSURU JN (MYS)',
    journeyDate: getLocalTodayDateStr(),
  })

  // Pre-flight Validation Error state
  const [validationError, setValidationError] = useState('')

  // Single Request Lifecycle Lock
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Autocomplete states
  const [fromSuggestions, setFromSuggestions] = useState([])
  const [toSuggestions, setToSuggestions] = useState([])
  const [activeInput, setActiveInput] = useState(null) // 'from' | 'to' | null

  const fromContainerRef = useRef(null)
  const toContainerRef = useRef(null)

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('railalert_recent_searches') : null
      if (saved) return JSON.parse(saved)
      const defaults = [
        { from: 'KSR BENGALURU (SBC)', to: 'MYSURU JN (MYS)' },
        { from: 'MYSURU JN (MYS)', to: 'HASAN (HAS)' },
      ]
      if (typeof window !== 'undefined') {
        localStorage.setItem('railalert_recent_searches', JSON.stringify(defaults))
      }
      return defaults
    } catch {
      return [
        { from: 'KSR BENGALURU (SBC)', to: 'MYSURU JN (MYS)' },
        { from: 'MYSURU JN (MYS)', to: 'HASAN (HAS)' },
      ]
    }
  })

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        fromContainerRef.current &&
        !fromContainerRef.current.contains(e.target) &&
        toContainerRef.current &&
        !toContainerRef.current.contains(e.target)
      ) {
        setActiveInput(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 250ms Debounced From Station Search
  useEffect(() => {
    if (activeInput !== 'from') return
    const timer = setTimeout(() => {
      const results = searchStations(formData.fromStation, 10)
      setFromSuggestions(results)
    }, 250)
    return () => clearTimeout(timer)
  }, [formData.fromStation, activeInput])

  // 250ms Debounced To Station Search
  useEffect(() => {
    if (activeInput !== 'to') return
    const timer = setTimeout(() => {
      const results = searchStations(formData.toStation, 10)
      setToSuggestions(results)
    }, 250)
    return () => clearTimeout(timer)
  }, [formData.toStation, activeInput])

  const handleFromChange = (e) => {
    const val = e.target.value
    setFormData((prev) => ({ ...prev, fromStation: val }))
    setValidationError('')
    setActiveInput('from')
  }

  const handleToChange = (e) => {
    const val = e.target.value
    setFormData((prev) => ({ ...prev, toStation: val }))
    setValidationError('')
    setActiveInput('to')
  }

  const selectFromStation = (st) => {
    setFormData((prev) => ({ ...prev, fromStation: `${st.name} (${st.code})` }))
    setValidationError('')
    setActiveInput(null)
  }

  const selectToStation = (st) => {
    setFormData((prev) => ({ ...prev, toStation: `${st.name} (${st.code})` }))
    setValidationError('')
    setActiveInput(null)
  }

  const handleSwap = () => {
    setFormData((prev) => ({
      ...prev,
      fromStation: prev.toStation,
      toStation: prev.fromStation,
    }))
    setValidationError('')
    setActiveInput(null)
  }

  const handleRecentClick = (item) => {
    setFormData((prev) => ({
      ...prev,
      fromStation: item.from,
      toStation: item.to,
    }))
    setValidationError('')
    setActiveInput(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSubmitting) return // Ignore duplicate clicks
    setActiveInput(null)

    const fromCode = extractStationCode(formData.fromStation)
    const toCode = extractStationCode(formData.toStation)

    // LOCAL PRE-FLIGHT VALIDATION
    if (!formData.fromStation || !fromCode) {
      setValidationError('Please select a valid origin station.')
      return
    }
    if (!formData.toStation || !toCode) {
      setValidationError('Please select a valid destination station.')
      return
    }
    if (fromCode === toCode) {
      setValidationError('Origin and Destination stations cannot be the same.')
      return
    }
    if (!formData.journeyDate) {
      setValidationError('Please select a valid journey date.')
      return
    }

    setValidationError('')
    setIsSubmitting(true)

    // Save to recent searches (keep last 3 unique)
    try {
      const newSearch = { from: formData.fromStation, to: formData.toStation }
      const filtered = recentSearches.filter(
        (s) => s.from !== newSearch.from || s.to !== newSearch.to
      )
      const updated = [newSearch, ...filtered].slice(0, 3)
      setRecentSearches(updated)
      localStorage.setItem('railalert_recent_searches', JSON.stringify(updated))
    } catch {
      // Ignore localStorage errors
    }

    const queryParams = new URLSearchParams({
      from: formData.fromStation,
      to: formData.toStation,
      date: formData.journeyDate,
    }).toString()

    setTimeout(() => {
      setIsSubmitting(false)
      navigate(`/journeys?${queryParams}`)
    }, 150)
  }

  return (
    <div className="w-full bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-lg shadow-blue-500/5 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
          <Train className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Track Your Journey</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Search trains between stations and set up real-time arrival tracking
          </p>
        </div>
      </div>

      {/* Pre-Flight Validation Alert Banner */}
      {validationError && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Main Station Stack */}
        <div className="space-y-4">
          
          {/* From Station with Autocomplete */}
          <div className="relative" ref={fromContainerRef}>
            <label htmlFor="fromStation" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              From Station (Origin)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600 dark:text-blue-400">
                <Navigation className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="fromStation"
                name="fromStation"
                value={formData.fromStation}
                onChange={handleFromChange}
                onFocus={() => setActiveInput('from')}
                placeholder="Type Station Name, Code or City (e.g. MYS, Bangalore)"
                className="w-full pl-12 pr-24 py-4 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
                autoComplete="off"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono text-xs font-black border border-blue-200 dark:border-blue-800">
                  {extractStationCode(formData.fromStation)}
                </span>
              </div>
            </div>

            {/* From Station Suggestions Dropdown Overlay */}
            {activeInput === 'from' && fromSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white dark:bg-[#161c26] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {fromSuggestions.map((st) => (
                  <button
                    key={`from-${st.code}`}
                    type="button"
                    onClick={() => selectFromStation(st)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 block truncate">
                        {st.name} {st.aliasName && <span className="text-xs font-bold text-slate-400 dark:text-slate-500">({st.aliasName})</span>}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white font-mono text-xs font-black text-slate-700 dark:text-slate-300 transition-colors shrink-0">
                      {st.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Stations Button */}
          <div className="relative flex justify-center py-1">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200/80 dark:border-slate-800/80" />
            </div>
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Origin and Destination Stations"
              className="relative z-10 p-3 rounded-full bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700 shadow-md hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>

          {/* To Station with Autocomplete */}
          <div className="relative" ref={toContainerRef}>
            <label htmlFor="toStation" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              To Station (Destination)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-rose-500">
                <MapPin className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="toStation"
                name="toStation"
                value={formData.toStation}
                onChange={handleToChange}
                onFocus={() => setActiveInput('to')}
                placeholder="Type Destination Station Name, Code or City (e.g. MYS, Mysore)"
                className="w-full pl-12 pr-24 py-4 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
                autoComplete="off"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-mono text-xs font-black border border-rose-200 dark:border-rose-800">
                  {extractStationCode(formData.toStation)}
                </span>
              </div>
            </div>

            {/* To Station Suggestions Dropdown Overlay */}
            {activeInput === 'to' && toSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white dark:bg-[#161c26] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {toSuggestions.map((st) => (
                  <button
                    key={`to-${st.code}`}
                    type="button"
                    onClick={() => selectToStation(st)}
                    className="w-full px-4 py-3 text-left hover:bg-rose-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 block truncate">
                        {st.name} {st.aliasName && <span className="text-xs font-bold text-slate-400 dark:text-slate-500">({st.aliasName})</span>}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-600 group-hover:text-white font-mono text-xs font-black text-slate-700 dark:text-slate-300 transition-colors shrink-0">
                      {st.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Journey Date Picker */}
        <div>
          <label htmlFor="journeyDate" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            📅 Journey Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Calendar className="w-5 h-5" />
            </div>
            <button
              type="button"
              id="journeyDate"
              onClick={() => setIsDatePickerOpen(true)}
              className="w-full text-left pl-12 pr-4 py-4 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-base font-bold text-slate-900 dark:text-white hover:border-blue-500 transition-all cursor-pointer shadow-inner flex items-center justify-between"
            >
              <span>{formatLocalDateDisplay(formData.journeyDate)}</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-extrabold uppercase bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                Change Date
              </span>
            </button>
          </div>
        </div>

        {/* Recent Searches Section */}
        {recentSearches.length > 0 ? (
          <div className="pt-1">
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-500" />
              Recent Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item, idx) => {
                const codeFrom = extractStationCode(item.from)
                const codeTo = extractStationCode(item.to)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRecentClick(item)}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/60 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title={`Click to fill: ${item.from} → ${item.to}`}
                  >
                    <span>{codeFrom}</span>
                    <span className="text-blue-500 font-black">→</span>
                    <span>{codeTo}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {/* Search Button with Single Request Lifecycle Lock */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-2xl text-white font-black text-base transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer ${
              isSubmitting
                ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35 hover:scale-[1.005] active:scale-[0.995]'
            }`}
          >
            <span>{isSubmitting ? 'Searching Trains...' : 'Search Trains'}</span>
            <ArrowRight className={`w-5 h-5 ${isSubmitting ? 'animate-pulse' : ''}`} />
          </button>
        </div>

      </form>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={formData.journeyDate}
        onSelectDate={(newDate) => setFormData((prev) => ({ ...prev, journeyDate: newDate }))}
      />
    </div>
  )
}

export default TrainSearchCard
