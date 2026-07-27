import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, X, Bell } from 'lucide-react'
import { mockTrains } from '../data/trainsData'

// Modular Components
import TrainSummaryCard from '../components/details/TrainSummaryCard'
import ImportantStopsCard from '../components/details/ImportantStopsCard'
import JourneyTimelineProgress from '../components/details/JourneyTimelineProgress'
import StickyBottomStatus from '../components/details/StickyBottomStatus'

function TrainDetailsPage() {
  const { trainNo } = useParams()
  const navigate = useNavigate()

  const train = mockTrains.find((t) => t.trainNo === trainNo) || mockTrains[0]

  // Active Journey state
  const activeJourneyRaw = typeof window !== 'undefined' ? localStorage.getItem('railalert_active_journey') : null
  const [isJourneyConfirmed, setIsJourneyConfirmed] = useState(Boolean(activeJourneyRaw))

  // Live Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshStatus = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  // Floating Footer Scroll Visibility State (appears ONLY while Train Route section is visible)
  const [showStickyFooter, setShowStickyFooter] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const routeElement = document.getElementById('train-route-section')
      if (routeElement) {
        const rect = routeElement.getBoundingClientRect()
        // Show footer only when Train Route section is within active viewport bounds
        if (rect.top <= window.innerHeight - 100 && rect.bottom >= 150) {
          setShowStickyFooter(true)
        } else {
          setShowStickyFooter(false)
        }
      } else {
        setShowStickyFooter(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll ref to current train location
  const currentTrainRef = useRef(null)

  useEffect(() => {
    // Auto-scroll so current train location is centered immediately on mount
    const timer = setTimeout(() => {
      if (currentTrainRef.current) {
        currentTrainRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [trainNo])

  // Confirmation Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [alertTime, setAlertTime] = useState('15 Mins Before Departure')

  const todayStr = new Date().toISOString().split('T')[0]

  // Handle final journey confirmation inside modal
  const handleActivateJourney = () => {
    const activeJourney = {
      trainNo: train.trainNo,
      trainName: train.trainName,
      from: train.from,
      to: train.to,
      departureTime: train.departureTime,
      date: todayStr,
      alertTime: alertTime,
      confirmedAt: new Date().toISOString(),
    }
    localStorage.setItem('railalert_active_journey', JSON.stringify(activeJourney))
    setIsJourneyConfirmed(true)
    setIsConfirmModalOpen(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-20 px-3 sm:px-4 pt-2">
      
      {/* 1. SIMPLIFIED HEADER (No Breadcrumbs) */}
      <TrainSummaryCard
        train={train}
        onConfirmClick={() => setIsConfirmModalOpen(true)}
      />

      {/* 2. JOURNEY PROGRESS (Displayed ONLY AFTER Confirmation) */}
      {isJourneyConfirmed && (
        <JourneyTimelineProgress train={train} />
      )}

      {/* 3. TRAIN ROUTE (Primary focus, all official halts, auto-scrolled to current location) */}
      <ImportantStopsCard
        ref={currentTrainRef}
        train={train}
      />

      {/* 4. STICKY FOOTER (Card-width bounded, appears ONLY while Train Route is in view) */}
      <StickyBottomStatus
        train={train}
        onRefreshClick={handleRefreshStatus}
        isRefreshing={isRefreshing}
        onConfirmClick={() => setIsConfirmModalOpen(true)}
        visible={showStickyFooter}
        isJourneyConfirmed={isJourneyConfirmed}
      />

      {/* CONFIRMATION MODAL DIALOG */}
      {isConfirmModalOpen && (
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
                    Confirm Train Journey
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Activate AI station alarm and route monitoring
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Train Info Summary Grid */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Train Name:</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{train.trainName}</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Train Number:</span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400">#{train.trainNo}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Route:</span>
                <span className="font-black text-slate-900 dark:text-white">{train.from} → {train.to}</span>
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
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-2.5 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleActivateJourney}
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

export default TrainDetailsPage
