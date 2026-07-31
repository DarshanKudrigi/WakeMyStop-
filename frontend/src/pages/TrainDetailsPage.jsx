import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangle, Train, Trash2 } from 'lucide-react'
import { useJourney } from '../context/JourneyContext'
import { getTrainDetails, getLiveTrainStatus } from '../services/trainService'
import { buildLiveJourneyState } from '../services/journeyTrackingEngine'

// Modular Components
import TrainSummaryCard from '../components/details/TrainSummaryCard'
import ImportantStopsCard from '../components/details/ImportantStopsCard'
import JourneyTimelineProgress from '../components/details/JourneyTimelineProgress'
import StickyBottomStatus from '../components/details/StickyBottomStatus'

function TrainDetailsPage() {
  const { trainNo } = useParams()
  const navigate = useNavigate()
  const { activeJourney, cancelJourney, refreshJourney } = useJourney()

  const [liveData, setLiveData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Active Journey check
  const isThisTrainConfirmed = activeJourney?.trainNo === String(trainNo)

  // Load real RailRadar train details and live status
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    async function loadTrainData() {
      try {
        const [detailsRes, liveRes] = await Promise.all([
          getTrainDetails(trainNo),
          getLiveTrainStatus(trainNo),
        ])

        if (!isMounted) return

        const unifiedState = buildLiveJourneyState(liveRes || detailsRes, {
          trainNo,
          journeyStatus: isThisTrainConfirmed ? 'Active' : 'Planned',
        })

        setLiveData(unifiedState)
      } catch (err) {
        console.warn('[TrainDetailsPage] Failed to fetch live status:', err.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadTrainData()

    return () => {
      isMounted = false
    }
  }, [trainNo, isThisTrainConfirmed])

  // Use activeJourney if confirmed, else fallback to loaded liveData
  const currentTrainState = isThisTrainConfirmed && activeJourney ? activeJourney : liveData

  // Fallback train object structure if API loading
  const trainObj = currentTrainState || {
    id: String(trainNo),
    trainNo: String(trainNo),
    trainName: 'Loading Train...',
    category: 'Superfast',
    from: 'MYS',
    to: 'SBC',
    departureTime: '07:40 PM',
    arrivalTime: '09:55 PM',
    duration: '2h 15m',
    distance: '138 km',
    runningStatus: 'Running On Time',
    currentStation: { code: 'MYS', name: 'MYSORE JN', status: 'at-station' },
    nextStation: { code: 'SBC', name: 'KSR BENGALURU', distance: '12 km' },
    stops: [],
  }

  // Live Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    if (isThisTrainConfirmed) {
      await refreshJourney()
    } else {
      const liveRes = await getLiveTrainStatus(trainNo)
      if (liveRes) {
        setLiveData(buildLiveJourneyState(liveRes, { trainNo }))
      }
    }
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  // Floating Footer Scroll Visibility State
  const [showStickyFooter, setShowStickyFooter] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const routeElement = document.getElementById('train-route-section')
      if (routeElement) {
        const rect = routeElement.getBoundingClientRect()
        const isInRouteView = rect.top <= window.innerHeight - 100 && rect.bottom > window.innerHeight + 20
        setShowStickyFooter(isInRouteView)
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
    const timer = setTimeout(() => {
      if (currentTrainRef.current) {
        currentTrainRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [trainNo])

  // Conflict Modal & Cancel Confirmation Modal states
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false)
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  // Mode 1 Action: "Confirm Journey" click
  const handleConfirmJourney = () => {
    if (activeJourney && activeJourney.trainNo !== String(trainNo)) {
      setIsConflictModalOpen(true)
    } else {
      navigate(`/alert-preferences/${trainNo}`)
    }
  }

  // Mode 2 Action: "Cancel Journey" click
  const handleOpenCancelDialog = () => {
    setIsCancelConfirmOpen(true)
  }

  // Action: View Current Active Journey
  const handleViewCurrentJourney = () => {
    setIsConflictModalOpen(false)
    if (activeJourney) {
      navigate(`/train/${activeJourney.trainNo}`)
    }
  }

  // Action: Confirm Cancel Current Journey
  const handleConfirmCancelJourney = () => {
    cancelJourney()
    setIsCancelConfirmOpen(false)
    setIsConflictModalOpen(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-20 px-3 sm:px-4 pt-2">
      
      {/* 1. TOP SUMMARY CARD */}
      <TrainSummaryCard
        train={trainObj}
        onConfirmClick={handleConfirmJourney}
        onCancelClick={handleOpenCancelDialog}
        isJourneyConfirmed={isThisTrainConfirmed}
      />

      {/* 2. JOURNEY PROGRESS (Displayed ONLY in Mode 2) */}
      {isThisTrainConfirmed && (
        <JourneyTimelineProgress train={trainObj} />
      )}

      {/* 3. TRAIN ROUTE */}
      <ImportantStopsCard
        ref={currentTrainRef}
        train={trainObj}
      />

      {/* 4. STICKY FOOTER */}
      <StickyBottomStatus
        train={trainObj}
        onRefreshClick={handleRefreshStatus}
        isRefreshing={isRefreshing}
        onConfirmClick={handleConfirmJourney}
        onCancelClick={handleOpenCancelDialog}
        visible={showStickyFooter}
        isJourneyConfirmed={isThisTrainConfirmed}
      />

      {/* CONFLICT DIALOG: Active Journey Detected */}
      {isConflictModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#161c26] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-150">
            
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Active Journey Detected
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                You already have an active journey. Only one journey can be tracked at a time. Please complete or cancel your existing journey before starting another.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleViewCurrentJourney}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Train className="w-4 h-4" />
                <span>View Current Journey</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsConflictModalOpen(false)
                  setIsCancelConfirmOpen(true)
                }}
                className="w-full py-2.5 px-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-black text-xs border border-rose-200 dark:border-rose-800 cursor-pointer flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Cancel Current Journey</span>
              </button>

              <button
                type="button"
                onClick={() => setIsConflictModalOpen(false)}
                className="w-full py-2 px-4 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer pt-1"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CANCEL JOURNEY CONFIRMATION DIALOG */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#161c26] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cancel Journey?
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Are you sure you want to stop monitoring this journey? This will remove your active journey and all active alerts.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-200 cursor-pointer"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelJourney}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                Yes, Cancel Journey
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default TrainDetailsPage
