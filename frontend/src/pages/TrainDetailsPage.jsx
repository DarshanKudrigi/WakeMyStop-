import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangle, Train, Trash2 } from 'lucide-react'
import { useJourney } from '../context/JourneyContext'
import { getTrainDetails, getLiveTrainStatus } from '../services/trainService'
import { buildLiveJourneyState } from '../services/journeyTrackingEngine'
import { smartRefreshEngine } from '../services/smartRefreshEngine'
import { journeyCache } from '../services/journeyCache'

// Modular Components
import TrainSummaryCard from '../components/details/TrainSummaryCard'
import ImportantStopsCard from '../components/details/ImportantStopsCard'
import JourneyTimelineProgress from '../components/details/JourneyTimelineProgress'
import StickyBottomStatus from '../components/details/StickyBottomStatus'

function TrainDetailsPage() {
  const { trainNo } = useParams()
  const navigate = useNavigate()
  const { activeJourney, cancelJourney } = useJourney()

  // Active Journey check
  const isThisTrainConfirmed = activeJourney?.trainNo === String(trainNo)

  // Synchronous Cache Initialization: Instant timeline render with 0 loading flicker when cache exists
  const [liveData, setLiveData] = useState(() => {
    if (isThisTrainConfirmed && activeJourney && Array.isArray(activeJourney.stops) && activeJourney.stops.length > 0) {
      return activeJourney
    }
    const cachedLive = journeyCache.get(trainNo, 'live')
    const cachedDetails = journeyCache.get(trainNo, 'details')
    const rawPayload = cachedLive?.responseData || cachedDetails?.responseData || null
    if (rawPayload) {
      return buildLiveJourneyState(rawPayload, { trainNo })
    }
    return null
  })

  const [isLoading, setIsLoading] = useState(() => !Boolean(liveData))
  const [lastRefreshMsg, setLastRefreshMsg] = useState('Updated a few seconds ago.')

  // 1. Single Live Status Fetch with Fallback (1 API Request Max when cache missing)
  useEffect(() => {
    let isMounted = true

    // If cache already initialized state, skip setting loading to true
    if (!liveData) {
      setIsLoading(true)
    }

    async function loadTrainData() {
      try {
        // Fetch Live Status (reuses 3.5-min cache internally, 0 network calls if cache valid)
        let liveRes = await getLiveTrainStatus(trainNo)

        // Fallback to schedule details only if live payload is empty
        if (!liveRes || !liveRes.data) {
          liveRes = await getTrainDetails(trainNo)
        }

        if (!isMounted) return

        const unifiedState = buildLiveJourneyState(liveRes, {
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

    // Start Smart Refresh Engine scheduler ONLY when journey is active & confirmed
    if (isThisTrainConfirmed) {
      smartRefreshEngine.startScheduler(trainNo, (updatedState) => {
        if (isMounted && updatedState) {
          setLiveData(updatedState)
          setLastRefreshMsg('Updated a few seconds ago.')
        }
      })
    }

    return () => {
      isMounted = false
      if (isThisTrainConfirmed) {
        smartRefreshEngine.stopScheduler()
      }
    }
  }, [trainNo, isThisTrainConfirmed])

  // Use activeJourney merged with liveData if confirmed, ensuring stops & currentStation are present
  const currentTrainState = isThisTrainConfirmed && activeJourney
    ? {
        ...liveData,
        ...activeJourney,
        stops: (Array.isArray(activeJourney.stops) && activeJourney.stops.length > 0)
          ? activeJourney.stops
          : (Array.isArray(liveData?.stops) && liveData.stops.length > 0 ? liveData.stops : []),
        currentStation: activeJourney.currentStation || liveData?.currentStation,
        nextStation: activeJourney.nextStation || liveData?.nextStation,
      }
    : liveData

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

  // Live Refresh state driven by Smart Refresh Engine
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    const result = await smartRefreshEngine.triggerManualRefresh(trainNo)
    if (result && result.liveState) {
      setLiveData(result.liveState)
    }
    setLastRefreshMsg('Updated a few seconds ago.')
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
        lastRefreshMsg={lastRefreshMsg}
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
                Only one journey can be tracked at a time. Please complete or cancel your existing journey before starting another.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleViewCurrentJourney}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Train className="w-4 h-4" />
                <span>View Active Journey</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmCancelJourney}
                className="w-full py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
              >
                End Current Journey & Track This Train
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#161c26] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-150">
            
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Cancel Active Journey?
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                This will stop live tracking and alerts for this train. You can start a new journey anytime.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Keep Tracking
              </button>

              <button
                type="button"
                onClick={handleConfirmCancelJourney}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
              >
                Yes, End Journey
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default TrainDetailsPage
