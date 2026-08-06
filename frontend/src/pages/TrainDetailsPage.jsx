import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, Train, Trash2 } from 'lucide-react'
import { useJourney } from '../context/JourneyContext'
import { getTrainDetails, getLiveTrainStatus } from '../services/trainService'
import { buildLiveJourneyState } from '../engines/journeyTrackingEngine'
import { smartRefreshEngine } from '../engines/smartRefreshEngine'
import { journeyCache } from '../cache/journeyCache'
import { extractStationCode } from '../utils/stationUtils'
import { getLocalTodayDateStr, getDateMode } from '../utils/dateUtils'

// Modular Components
import TrainSummaryCard from '../components/details/TrainSummaryCard'
import ImportantStopsCard from '../components/details/ImportantStopsCard'
import JourneyTimelineProgress from '../components/details/JourneyTimelineProgress'
import StickyBottomStatus from '../components/details/StickyBottomStatus'

function TrainDetailsPage() {
  const { trainNo } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { activeJourney, cancelJourney } = useJourney()

  const fromParam = extractStationCode(searchParams.get('from'))
  const toParam = extractStationCode(searchParams.get('to'))
  const dateParam = searchParams.get('date') || getLocalTodayDateStr()
  const dateMode = getDateMode(dateParam)

  // Active Journey check (Only valid for Today / Future active journeys)
  const isThisTrainConfirmed = dateMode !== 'HISTORICAL' && activeJourney?.trainNo === String(trainNo)

  // Synchronous Cache Initialization: Instant timeline render with 0 loading flicker when cache exists
  const [liveData, setLiveData] = useState(() => {
    if (isThisTrainConfirmed && activeJourney && Array.isArray(activeJourney.stops) && activeJourney.stops.length > 0) {
      return activeJourney
    }
    const cachedLive = journeyCache.get(trainNo, 'live')
    const cachedDetails = journeyCache.get(trainNo, 'details')
    const rawPayload = dateMode === 'HISTORICAL' ? cachedDetails?.responseData : (cachedLive?.responseData || cachedDetails?.responseData || null)
    if (rawPayload) {
      return buildLiveJourneyState(rawPayload, { trainNo, from: fromParam, to: toParam, dateMode, selectedDate: dateParam })
    }
    return null
  })

  const [isLoading, setIsLoading] = useState(() => !Boolean(liveData))
  const [lastRefreshMsg, setLastRefreshMsg] = useState('Updated a few seconds ago.')

  // 1. Data Fetch Layer with Mode Awareness
  useEffect(() => {
    let isMounted = true

    if (!liveData) {
      setIsLoading(true)
    }

    async function loadTrainData() {
      try {
        let payload = null

        if (dateMode === 'HISTORICAL') {
          // HISTORICAL MODE: Fetch official timetable schedule ONLY (0 live status requests!)
          payload = await getTrainDetails(trainNo)
        } else {
          // TODAY / FUTURE MODE: Fetch live status with fallback to details
          payload = await getLiveTrainStatus(trainNo)
          if (!payload || !payload.data) {
            payload = await getTrainDetails(trainNo)
          }
        }

        if (!isMounted || !payload) return

        const unifiedState = buildLiveJourneyState(payload, {
          trainNo,
          from: fromParam,
          to: toParam,
          dateMode,
          selectedDate: dateParam,
          journeyStatus: isThisTrainConfirmed ? 'Active' : (dateMode === 'HISTORICAL' ? 'Historical Schedule' : 'Planned'),
        })

        setLiveData(unifiedState)
      } catch (err) {
        console.warn('[TrainDetailsPage] Failed to fetch train data:', err.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadTrainData()

    // Start Smart Refresh Engine scheduler ONLY in Today mode when journey is active & confirmed
    if (dateMode === 'TODAY' && isThisTrainConfirmed) {
      smartRefreshEngine.startScheduler(trainNo, (updatedState) => {
        if (isMounted && updatedState) {
          setLiveData(updatedState)
          setLastRefreshMsg('Updated a few seconds ago.')
        }
      })
    }

    return () => {
      isMounted = false
      if (dateMode === 'TODAY' && isThisTrainConfirmed) {
        smartRefreshEngine.stopScheduler()
      }
    }
  }, [trainNo, isThisTrainConfirmed, fromParam, toParam, dateMode, dateParam])

  // Single Source of Truth merging
  const currentTrainState = isThisTrainConfirmed && activeJourney
    ? {
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
    from: fromParam || 'MYS',
    to: toParam || 'SBC',
    departureTime: '07:40 PM',
    arrivalTime: '09:55 PM',
    duration: '2h 15m',
    distance: '138 km',
    runningStatus: dateMode === 'HISTORICAL' ? 'Scheduled Timetable' : 'Running On Time',
    currentStation: { code: 'MYS', name: 'MYSORE JN', status: 'at-station' },
    nextStation: { code: 'SBC', name: 'KSR BENGALURU', distance: '12 km' },
    stops: [],
  }

  // Live Refresh state driven by Smart Refresh Engine
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshStatus = async () => {
    if (dateMode === 'HISTORICAL') return
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
    if (dateMode === 'HISTORICAL') {
      setShowStickyFooter(false)
      return
    }

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
  }, [dateMode])

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
    const queryStr = `?from=${encodeURIComponent(fromParam)}&to=${encodeURIComponent(toParam)}&date=${dateParam}`
    if (activeJourney && activeJourney.trainNo !== String(trainNo)) {
      setIsConflictModalOpen(true)
    } else {
      navigate(`/alert-preferences/${trainNo}${queryStr}`)
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
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-28">
      
      {/* 1. Train Summary Card (Mode 1: Confirm Journey | Mode 2: Cancel Journey | Historical Mode) */}
      <TrainSummaryCard
        train={trainObj}
        dateMode={dateMode}
        selectedDate={dateParam}
        isJourneyConfirmed={isThisTrainConfirmed}
        onConfirmClick={handleConfirmJourney}
        onCancelClick={handleOpenCancelDialog}
      />

      {/* 2. Journey Timeline Progress Card (MODE 2 ONLY: Rendered when journey confirmed) */}
      {isThisTrainConfirmed && dateMode !== 'HISTORICAL' && (
        <JourneyTimelineProgress train={trainObj} />
      )}

      {/* 3. Important Stops Card (Timeline Railway Track) */}
      <ImportantStopsCard
        ref={currentTrainRef}
        train={trainObj}
        dateMode={dateMode}
      />

      {/* 4. Compact Card-Width Sticky Bottom Sheet Footer (Today Mode only) */}
      {dateMode !== 'HISTORICAL' && (
        <StickyBottomStatus
          train={trainObj}
          visible={showStickyFooter}
          isRefreshing={isRefreshing}
          onRefreshClick={handleRefreshStatus}
          isJourneyConfirmed={isThisTrainConfirmed}
          onConfirmClick={handleConfirmJourney}
          onCancelClick={handleOpenCancelDialog}
        />
      )}

      {/* MODAL 1: CONFLICT MODAL (When active journey already exists for another train) */}
      {isConflictModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161c26] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Active Journey Already Exists
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                You already have an active journey running for train <strong className="text-slate-800 dark:text-slate-200 font-extrabold">{activeJourney?.trainNo} ({activeJourney?.trainName})</strong>. Please cancel it first to confirm a new journey.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleViewCurrentJourney}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all cursor-pointer text-center"
              >
                View Active Journey
              </button>
              <button
                type="button"
                onClick={() => setIsConflictModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CANCEL JOURNEY CONFIRMATION MODAL */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161c26] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cancel Active Journey?
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to stop tracking train <strong className="text-slate-800 dark:text-slate-200 font-extrabold">{trainObj.trainNo} ({trainObj.trainName})</strong>? Smart Refresh and live station alerts will be disabled.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmCancelJourney}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all cursor-pointer text-center"
              >
                Yes, Cancel Journey
              </button>
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Keep Journey
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default TrainDetailsPage
