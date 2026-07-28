import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  const isJourneyConfirmed = Boolean(activeJourneyRaw)

  // Live Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshStatus = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  // Floating Footer Scroll Visibility State (appears ONLY while Train Route section is active in viewport)
  const [showStickyFooter, setShowStickyFooter] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const routeElement = document.getElementById('train-route-section')
      if (routeElement) {
        const rect = routeElement.getBoundingClientRect()
        // Footer is visible ONLY while user is scrolling inside the Train Route section
        const isInRouteView = rect.top <= window.innerHeight - 100 && rect.bottom > 120
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
    // Auto-scroll so current train location is centered immediately on mount
    const timer = setTimeout(() => {
      if (currentTrainRef.current) {
        currentTrainRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [trainNo])

  // Navigate to Alert Preferences page immediately upon clicking "Confirm Journey"
  const handleConfirmJourney = () => {
    navigate(`/alert-preferences/${train.trainNo}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-20 px-3 sm:px-4 pt-2">
      
      {/* 1. SIMPLIFIED HEADER (No Breadcrumbs) */}
      <TrainSummaryCard
        train={train}
        onConfirmClick={handleConfirmJourney}
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
        onConfirmClick={handleConfirmJourney}
        visible={showStickyFooter}
        isJourneyConfirmed={isJourneyConfirmed}
      />

    </div>
  )
}

export default TrainDetailsPage
