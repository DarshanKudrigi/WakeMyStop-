import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Navigation, Calendar, ArrowUpDown, Train, ArrowRight, History } from 'lucide-react'
import DatePickerModal from '../common/DatePickerModal'

function TrainSearchCard() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fromStation: 'Bengaluru Cantt (BNC)',
    toStation: 'Mysuru Junction (MYS)',
    journeyDate: new Date().toISOString().split('T')[0],
  })

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('railalert_recent_searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      } else {
        // Pre-populate 2 default sample recent searches
        const defaults = [
          { from: 'Bengaluru Cantt (BNC)', to: 'Mysuru Junction (MYS)' },
          { from: 'Mysuru Junction (MYS)', to: 'Hassan Junction (HAS)' },
        ]
        setRecentSearches(defaults)
        localStorage.setItem('railalert_recent_searches', JSON.stringify(defaults))
      }
    } catch {
      // Fallback
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwap = () => {
    setFormData((prev) => ({
      ...prev,
      fromStation: prev.toStation,
      toStation: prev.fromStation,
    }))
  }

  const handleRecentClick = (item) => {
    setFormData((prev) => ({
      ...prev,
      fromStation: item.from,
      toStation: item.to,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

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

    navigate(`/journeys?${queryParams}`)
  }

  // Helper for station code tag
  const getStationCode = (stationStr) => {
    const match = stationStr.match(/\(([^)]+)\)/)
    return match ? match[1] : stationStr.slice(0, 3).toUpperCase()
  }

  // Format date display (e.g. 2026-07-26 -> Sun, 26 Jul 2026)
  const formatFormattedDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
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

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Main Station Stack */}
        <div className="space-y-4">
          
          {/* From Station */}
          <div>
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
                onChange={handleChange}
                placeholder="Origin Station Name or Code (e.g. BNC, SBC)"
                className="w-full pl-12 pr-24 py-4 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono text-xs font-black border border-blue-200 dark:border-blue-800">
                  {getStationCode(formData.fromStation)}
                </span>
              </div>
            </div>
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

          {/* To Station */}
          <div>
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
                onChange={handleChange}
                placeholder="Destination Station Name or Code (e.g. MYS)"
                className="w-full pl-12 pr-24 py-4 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-mono text-xs font-black border border-rose-200 dark:border-rose-800">
                  {getStationCode(formData.toStation)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Date Picker (Opens Custom Calendar Modal) */}
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
              <span>{formatFormattedDate(formData.journeyDate)}</span>
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
                const codeFrom = getStationCode(item.from)
                const codeTo = getStationCode(item.to)
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

        {/* Large Prominent Blue Gradient Search Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35 hover:scale-[1.005] active:scale-[0.995] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Search Trains</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </form>

      {/* Custom Date Picker Modal */}
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
