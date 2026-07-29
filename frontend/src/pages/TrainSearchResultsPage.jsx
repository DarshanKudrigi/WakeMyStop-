import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { mockTrains } from '../data/trainsData'
import TrainCard from '../components/journey/TrainCard'
import { ArrowRight, SlidersHorizontal, Train, Calendar } from 'lucide-react'
import { calculateAiRecommendations, timeToMinutes } from '../utils/aiRecommendationEngine'

const filterCategories = [
  'All',
  'Express',
  'Superfast',
  'MEMU',
  'Passenger',
  'Shatabdi',
  'Rajdhani',
  'Vande Bharat',
]

// Strictly 3 Sort Options
const sortOptions = [
  { value: 'departure', label: 'Departure Time' },
  { value: 'arrival', label: 'Arrival Time' },
  { value: 'duration', label: 'Journey Duration' },
]

function TrainSearchResultsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const fromStation = searchParams.get('from') || 'Bengaluru Cantt (BNC)'
  const toStation = searchParams.get('to') || 'Mysuru Junction (MYS)'
  
  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const initialDate = searchParams.get('date') || todayStr

  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('departure')

  // Loading state for smooth transitions
  const [isLoading, setIsLoading] = useState(false)

  // Throttled scroll listener state for showing the constant-height compact toolbar
  const [showCompactBar, setShowCompactBar] = useState(false)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowCompactBar(window.scrollY > 140)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handlers for filter and date changes with quick smooth loading state
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 200)
  }

  const handleFilterChange = (cat) => {
    setActiveFilter(cat)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 200)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 200)
  }

  // Compute date mode: 'TODAY', 'FUTURE', or 'PAST'
  const dateMode = useMemo(() => {
    if (!selectedDate) return 'TODAY'
    if (selectedDate === todayStr) return 'TODAY'
    return selectedDate > todayStr ? 'FUTURE' : 'PAST'
  }, [selectedDate, todayStr])

  // Calculate dynamic AI Recommendations (Max 2 Trains)
  const { recommendations: aiRecommendations } = useMemo(() => {
    return calculateAiRecommendations(mockTrains, selectedDate, dateMode)
  }, [selectedDate, dateMode])

  // Calculate dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: mockTrains.length }
    filterCategories.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = mockTrains.filter(
          (t) => t.category.toLowerCase() === cat.toLowerCase()
        ).length
      }
    })
    return counts
  }, [])

  // Format date display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Filter and sort trains dynamically
  const filteredAndSortedTrains = useMemo(() => {
    let result = [...mockTrains]

    if (activeFilter !== 'All') {
      result = result.filter(
        (t) => t.category.toLowerCase() === activeFilter.toLowerCase()
      )
    }

    result.sort((a, b) => {
      if (sortBy === 'duration') {
        return a.durationMinutes - b.durationMinutes
      }
      if (sortBy === 'arrival') {
        return timeToMinutes(a.arrivalTime) - timeToMinutes(b.arrivalTime)
      }
      return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime)
    })

    return result
  }, [activeFilter, sortBy])

  // Enforce flow: Clicking a train card navigates to Train Details page
  const handleSelectTrain = (train) => {
    navigate(`/train/${train.trainNo}`)
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 pt-2">
      
      {/* 1. COMPACT STICKY TOOLBAR (Constant 56px height, zero layout shifts, opacity & transform animation ONLY) */}
      <div
        className={`sticky top-2 z-30 h-14 -mx-2 px-2 transition-all duration-200 ease-in-out ${
          showCompactBar
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        <div className="w-full h-full bg-white/95 dark:bg-[#161c26]/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/90 px-4 flex items-center justify-between shadow-md">
          {/* Route Summary */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
            <span>{fromStation.split('(')[0].trim()} → {toStation.split('(')[0].trim()}</span>
            <span className="text-slate-400 font-bold text-xs">({filteredAndSortedTrains.length})</span>
          </div>

          {/* Controls ONLY: Date & Sort */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="compact-date-input"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-900 dark:text-white cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <input
                id="compact-date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer w-28"
              />
            </label>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-900 dark:text-white">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#161c26]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (In Normal Document Flow - Scrolls away naturally without layout thrashing) */}
      <div className="w-full bg-white dark:bg-[#161c26] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 shadow-md shadow-blue-500/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Station Origin -> Destination Display & Selected Date */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex-wrap">
              <span>{fromStation.split('(')[0].trim()}</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 shrink-0 stroke-[2.5]" />
              <span>{toStation.split('(')[0].trim()}</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>📅 {formatDateDisplay(selectedDate)}</span>
              {dateMode === 'FUTURE' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Future Date
                </span>
              )}
            </p>
          </div>

          {/* Controls: Trains Badge, Date Selector, Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <span className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 font-black text-xs sm:text-sm border border-blue-500/20 shadow-xs min-h-[42px]">
              <Train className="w-4 h-4" />
              <span>{filteredAndSortedTrains.length} Trains</span>
            </span>

            <label
              htmlFor="main-date-input"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-xs cursor-pointer hover:bg-slate-200/70 transition-colors flex-1 sm:flex-none min-h-[42px]"
            >
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <input
                id="main-date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </label>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-xs flex-1 sm:flex-none min-h-[42px]">
              <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#161c26] text-slate-900 dark:text-white font-semibold">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/80">
          {filterCategories.map((cat) => {
            const isActive = activeFilter === cat
            const count = categoryCounts[cat] || 0
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleFilterChange(cat)}
                className={`py-2 px-3.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/60 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. AI RECOMMENDATIONS BLOCK */}
      {!isLoading && aiRecommendations.length > 0 && (
        <div className="w-full bg-white dark:bg-[#161c26] rounded-3xl border border-blue-200/80 dark:border-slate-800/90 p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤖</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                AI Smart Recommendations
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Based on your current time, these are the best train options.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiRecommendations.map((rec) => (
              <TrainCard
                key={`rec-${rec.train.id}`}
                train={rec.train}
                selectedDate={selectedDate}
                dateMode={dateMode}
                isRecommendedCard={true}
                onConfirmClick={(t) => handleSelectTrain(t)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. TRAIN LIST RESULTS */}
      {isLoading ? (
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full bg-white dark:bg-[#161c26] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse"
            >
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
              <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {filteredAndSortedTrains.length > 0 ? (
            filteredAndSortedTrains.map((train) => (
              <TrainCard
                key={train.id}
                train={train}
                selectedDate={selectedDate}
                dateMode={dateMode}
                onConfirmClick={(t) => handleSelectTrain(t)}
              />
            ))
          ) : (
            <div className="bg-white dark:bg-[#161c26] rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center font-bold text-3xl">
                🚆
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                No trains available
              </h3>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default TrainSearchResultsPage
