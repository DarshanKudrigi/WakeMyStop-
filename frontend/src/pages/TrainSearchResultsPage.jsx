import { useState, useMemo } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { mockTrains } from '../data/trainsData'
import TrainCard from '../components/journey/TrainCard'
import { ArrowRight, ChevronRight, SlidersHorizontal, Train, Calendar, X, CheckCircle, Bell } from 'lucide-react'
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

  // Modal State for Journey Confirmation
  const [confirmingTrain, setConfirmingTrain] = useState(null)
  const [alertTime, setAlertTime] = useState('15 Mins Before Departure')

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

  // Filter and sort trains dynamically (Chronological 24-hour time sorting)
  const filteredAndSortedTrains = useMemo(() => {
    let result = [...mockTrains]

    // Category filter
    if (activeFilter !== 'All') {
      result = result.filter(
        (t) => t.category.toLowerCase() === activeFilter.toLowerCase()
      )
    }

    // Sort logic
    result.sort((a, b) => {
      if (sortBy === 'duration') {
        return a.durationMinutes - b.durationMinutes
      }
      if (sortBy === 'arrival') {
        return timeToMinutes(a.arrivalTime) - timeToMinutes(b.arrivalTime)
      }
      // Default: departure time
      return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime)
    })

    return result
  }, [activeFilter, sortBy])

  // Handle final journey confirmation inside modal
  const handleFinalConfirm = () => {
    if (!confirmingTrain) return
    const activeJourney = {
      trainNo: confirmingTrain.trainNo,
      trainName: confirmingTrain.trainName,
      from: confirmingTrain.from,
      to: confirmingTrain.to,
      departureTime: confirmingTrain.departureTime,
      date: selectedDate,
      alertTime: alertTime,
      confirmedAt: new Date().toISOString(),
    }
    localStorage.setItem('railalert_active_journey', JSON.stringify(activeJourney))
    setConfirmingTrain(null)
    navigate(`/train/${confirmingTrain.trainNo}`)
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Clean Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
        <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-extrabold">Train Search Results</span>
      </nav>

      {/* STICKY HEADER SECTION (Route, Date, Calendar, Sort, Filter Chips) */}
      <div className="sticky top-0 z-30 bg-slate-50/95 dark:bg-[#0b0f19]/95 backdrop-blur-md pt-2 pb-3 space-y-4 -mx-2 px-2 shadow-xs">
        
        {/* Page Title & Route Header Block (Route -> Date -> Calendar -> Sort) */}
        <div className="w-full bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 shadow-md shadow-blue-500/5 space-y-4">
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
                {dateMode === 'PAST' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                    Past Date
                  </span>
                )}
              </p>
            </div>

            {/* Top-Right Controls Section: Calendar Button & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
              
              {/* Trains Found Badge */}
              <span className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 font-black text-xs sm:text-sm border border-blue-500/20 shadow-xs min-h-[42px]">
                <Train className="w-4 h-4" />
                <span>{filteredAndSortedTrains.length} Trains</span>
              </span>

              {/* Date Selector: Entire Container Clickable */}
              <label
                htmlFor="mobile-date-input"
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input')
                  if (input && typeof input.showPicker === 'function') {
                    try { input.showPicker() } catch { /* Ignore */ }
                  }
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-xs cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors flex-1 sm:flex-none justify-between sm:justify-start min-h-[42px]"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 sm:hidden">Date:</span>
                </div>
                <input
                  id="mobile-date-input"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  title="Select Travel Date"
                />
              </label>

              {/* Sort Dropdown Container */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-xs flex-1 sm:flex-none justify-between sm:justify-start min-h-[42px]">
                <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <label htmlFor="sort-select" className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">Sort:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#111936] text-slate-900 dark:text-white font-semibold">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

          </div>
        </div>

        {/* Filter Chips Bar (Dynamic counts) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterCategories.map((cat) => {
            const isActive = activeFilter === cat
            const count = categoryCounts[cat] || 0
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleFilterChange(cat)}
                className={`py-2.5 px-4 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-white dark:bg-[#111936] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>

      </div>

      {/* SIMPLIFIED AI SMART RECOMMENDATIONS BLOCK (Max 2 Cards, Highlighted) */}
      {!isLoading && aiRecommendations.length > 0 && (
        <div className="w-full bg-white dark:bg-[#111936] rounded-3xl border border-blue-200/80 dark:border-slate-800/90 p-5 sm:p-6 space-y-4 shadow-sm">
          {/* Clean Simplified Header */}
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

          {/* Max 2 Recommendation Cards Grid (Highlighted via isRecommendedCard) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiRecommendations.map((rec) => (
              <TrainCard
                key={`rec-${rec.train.id}`}
                train={rec.train}
                selectedDate={selectedDate}
                dateMode={dateMode}
                isRecommendedCard={true}
                onConfirmClick={(t) => setConfirmingTrain(t)}
              />
            ))}
          </div>
        </div>
      )}

      {/* LOADING STATE SKELETONS */}
      {isLoading ? (
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full bg-white dark:bg-[#111936] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/6"></div>
              </div>
              <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Normal Train List Header Label */}
          <div className="pt-2 flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              All Available Services ({filteredAndSortedTrains.length})
            </h3>
          </div>

          {/* Vertical Train List Cards (Original Chronological Order Unchanged) */}
          <div className="space-y-4">
            {filteredAndSortedTrains.length > 0 ? (
              filteredAndSortedTrains.map((train) => (
                <TrainCard
                  key={train.id}
                  train={train}
                  selectedDate={selectedDate}
                  dateMode={dateMode}
                  onConfirmClick={(t) => setConfirmingTrain(t)}
                />
              ))
            ) : (
              /* FRIENDLY EMPTY STATE */
              <div className="bg-white dark:bg-[#111936] rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center font-bold text-3xl">
                  🚆
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    No trains available
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                    No train services match your selected category filter ("{activeFilter}") or travel date ({formatDateDisplay(selectedDate)}). Try adjusting your category filters or choosing a different travel date.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('All')}
                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md cursor-pointer transition-colors"
                  >
                    Reset Category Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayStr)}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-extrabold text-xs cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    Select Today's Date
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* CONFIRMATION MODAL DIALOG (Requirement 10) */}
      {confirmingTrain && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111936] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Confirm Your Journey
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Review journey details before activating live alert tracking
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmingTrain(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Train Info Summary Grid */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Train Name:</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{confirmingTrain.trainName}</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Train Number:</span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400">#{confirmingTrain.trainNo}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Route:</span>
                <span className="font-black text-slate-900 dark:text-white">{confirmingTrain.from} → {confirmingTrain.to}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Travel Date:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{formatDateDisplay(selectedDate)}</span>
              </div>

              {/* Alert Time Selection */}
              <div className="pt-1 space-y-1.5">
                <label className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Configure Station Alert Notification:</span>
                </label>
                <select
                  value={alertTime}
                  onChange={(e) => setAlertTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#111936] border border-slate-300 dark:border-slate-700 font-extrabold text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="10 Mins Before Departure">10 Mins Before Departure</option>
                  <option value="15 Mins Before Departure">15 Mins Before Departure</option>
                  <option value="30 Mins Before Departure">30 Mins Before Departure</option>
                  <option value="15 Mins Before Arrival">15 Mins Before Destination Arrival</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingTrain(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md active:scale-[0.98] cursor-pointer transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm & Activate Journey</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default TrainSearchResultsPage
