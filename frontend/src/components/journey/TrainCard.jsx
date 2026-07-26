import { useNavigate } from 'react-router-dom'
import { CheckCircle, Info } from 'lucide-react'

// Single letter days matching 'Where Is My Train' (S M T W T F S)
const weekLetters = [
  { letter: 'S', name: 'Sun' },
  { letter: 'M', name: 'Mon' },
  { letter: 'T', name: 'Tue' },
  { letter: 'W', name: 'Wed' },
  { letter: 'T', name: 'Thu' },
  { letter: 'F', name: 'Fri' },
  { letter: 'S', name: 'Sat' },
]

// Only display badges for premium train categories
const PREMIUM_CATEGORIES = ['Vande Bharat', 'Shatabdi', 'Rajdhani']

// Helper function to compute expected departure time given a delay in minutes
function getUpdatedDepartureTime(timeStr, delayMins) {
  if (!delayMins || delayMins === 0) return timeStr
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return timeStr

  let hours = parseInt(match[1], 10)
  let minutes = parseInt(match[2], 10)
  const period = match[3].toUpperCase()

  if (period === 'PM' && hours < 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const totalMins = hours * 60 + minutes + delayMins
  const newHours24 = Math.floor((totalMins / 60) % 24)
  const newMins = Math.floor(totalMins % 60)

  const newPeriod = newHours24 >= 12 ? 'PM' : 'AM'
  let newHours12 = newHours24 % 12
  if (newHours12 === 0) newHours12 = 12

  return `${String(newHours12).padStart(2, '0')}:${String(newMins).padStart(2, '0')} ${newPeriod}`
}

function TrainCard({
  train,
  selectedDate,
  dateMode = 'TODAY',
  isRecommendedCard = false,
  onConfirmClick,
}) {
  const navigate = useNavigate()

  // Determine day of week for selected date
  const selectedDayIndex = selectedDate
    ? new Date(selectedDate + 'T00:00:00').getDay()
    : new Date().getDay()

  const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const selectedDayName = weekDayNames[selectedDayIndex]

  // Check if train operates on the selected date
  const runsOnSelectedDate = train.runsDaily || train.runningDays?.includes(selectedDayName)

  // Check active journey in localStorage
  const hasActiveJourney =
    typeof window !== 'undefined' && localStorage.getItem('railalert_active_journey') !== null

  // Modes
  const isTodayMode = dateMode === 'TODAY'

  // Confirm Journey enabled ONLY on TODAY mode + train runs on selected date + no active journey
  const isConfirmDisabled = !isTodayMode || !runsOnSelectedDate || hasActiveJourney

  const updatedDepartureTime = getUpdatedDepartureTime(train.departureTime, train.delayMinutes)
  const stationNameShort = train.from ? train.from.split(' ')[0] : 'Mysuru'
  const platformStr = train.platform || 'Platform 1'
  const isPremiumCategory = PREMIUM_CATEGORIES.includes(train.category)

  const handleCardClick = () => {
    navigate(`/train/${train.trainNo}`)
  }

  const handleConfirmJourney = (e) => {
    e.stopPropagation()
    if (isConfirmDisabled) return
    if (onConfirmClick) {
      onConfirmClick(train)
    } else {
      navigate(`/train/${train.trainNo}`)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`w-full bg-white dark:bg-[#111936] rounded-2xl p-4 sm:p-5 transition-all duration-200 ease-out cursor-pointer space-y-3.5 relative overflow-hidden ${
        isRecommendedCard
          ? 'border-2 border-blue-500/80 dark:border-blue-500/70 ring-1 ring-blue-500/20 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5'
          : 'border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:shadow-md hover:shadow-blue-500/5 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700'
      } ${!runsOnSelectedDate ? 'opacity-65 grayscale-[20%]' : ''}`}
    >
      
      {/* TOP ROW: Train Number Badge, Train Name, Premium Category Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Blue Rounded Train Number Badge */}
          <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs shadow-xs">
            {train.trainNo}
          </span>

          {/* Train Name */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {train.trainName}
          </h3>

          {/* Premium Category Badge ONLY */}
          {isPremiumCategory ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              [{train.category}]
            </span>
          ) : null}
        </div>
      </div>

      {/* SECOND ROW: Departure Time — Journey Duration — Arrival Time Strip */}
      <div className="flex items-center justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white py-1.5 border-y border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-bold uppercase">Dep:</span>
          <span>{train.departureTime}</span>
        </div>

        <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80">
          — {train.duration} —
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-bold uppercase">Arr:</span>
          <span>{train.arrivalTime}</span>
        </div>
      </div>

      {/* THIRD ROW: Operational Status (LEFT) & Running Days (RIGHT) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        
        {/* LEFT: Operational Status Badge (Slightly Reduced Height/Padding for Compactness) */}
        <div>
          {!runsOnSelectedDate ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/70 leading-tight">
              <span>Not running today</span>
            </span>
          ) : isTodayMode ? (
            train.isDelayed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black bg-red-600 text-white dark:bg-red-600 dark:text-white shadow-xs border border-red-500/40 leading-tight">
                <span>Expected Departure: {updatedDepartureTime} • {platformStr}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white shadow-xs border border-emerald-500/40 leading-tight">
                <span>Leaving {stationNameShort} at {train.departureTime} • {platformStr}</span>
              </span>
            )
          ) : (
            /* FUTURE or PAST Mode: Display Scheduled Departure only */
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 leading-tight">
              <span>Scheduled Departure: {train.departureTime}</span>
            </span>
          )}
        </div>

        {/* RIGHT: Running Days Information (Subtle Neutral Badge vs Weekdays) */}
        <div>
          {train.runsDaily ? (
            /* Subtle Neutral Badge for Runs Daily */
            <span className="inline-block px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 font-bold text-xs">
              Runs Daily
            </span>
          ) : (
            /* Weekday Indicators Only */
            <div className="flex items-center gap-1.5 text-xs">
              {weekLetters.map((item, idx) => {
                const isRunningOnDay = train.runningDays?.includes(item.name)
                return (
                  <span
                    key={idx}
                    className={
                      isRunningOnDay
                        ? 'font-black text-slate-900 dark:text-white underline underline-offset-4 decoration-blue-600 decoration-2'
                        : 'font-semibold text-slate-400 dark:text-slate-600'
                    }
                    title={`${item.name} ${isRunningOnDay ? '(Runs)' : '(Does not run)'}`}
                  >
                    {item.letter}
                  </span>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* FOURTH ROW: Action Button (Confirm Journey - Full Width on Mobile, Auto on Desktop) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Notice alert when Confirm Journey is disabled */}
        {hasActiveJourney ? (
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Active journey in progress</span>
          </span>
        ) : !runsOnSelectedDate ? (
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Not running on selected date</span>
          </span>
        ) : <div className="hidden sm:block" />}

        {/* Action Button: Confirm Journey (Spans Full Width on Mobile, Comfortable Touch Area) */}
        <div className="w-full sm:w-auto shrink-0 sm:ml-auto">
          <button
            type="button"
            disabled={isConfirmDisabled}
            onClick={handleConfirmJourney}
            className="w-full sm:w-auto py-2.5 px-5 min-h-[44px] rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Confirm Journey</span>
          </button>
        </div>

      </div>

    </div>
  )
}

export default TrainCard
