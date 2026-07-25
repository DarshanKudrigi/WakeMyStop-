import { useState, useEffect } from 'react'
import CurrentJourneyCard from '../components/dashboard/CurrentJourneyCard'
import TrainSearchCard from '../components/dashboard/TrainSearchCard'
import LiveTrainStatusCard from '../components/dashboard/LiveTrainStatusCard'
import FeaturesSection from '../components/dashboard/FeaturesSection'

function DashboardPage() {
  const [activeJourney, setActiveJourney] = useState(null)

  // Load active journey from localStorage if confirmed by user
  useEffect(() => {
    try {
      const saved = localStorage.getItem('railalert_active_journey')
      if (saved) {
        setActiveJourney(JSON.parse(saved))
      } else {
        setActiveJourney(null)
      }
    } catch {
      setActiveJourney(null)
    }
  }, [])

  const handleCompleteJourney = () => {
    setActiveJourney(null)
    try {
      localStorage.removeItem('railalert_active_journey')
    } catch {
      // Ignore
    }
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Active Journey Ticket Card (ONLY shown when user has a confirmed active journey) */}
      {activeJourney ? (
        <CurrentJourneyCard
          journey={activeJourney}
          onCompleteJourney={handleCompleteJourney}
        />
      ) : null}

      {/* Track Your Journey Card (Full-width search container) */}
      <section className="w-full">
        <TrainSearchCard />
      </section>

      {/* Live Train Status Card (Full-width lookup container) */}
      <section className="w-full">
        <LiveTrainStatusCard />
      </section>

      {/* About RailAlert AI & 4 Feature Cards */}
      <section className="w-full">
        <FeaturesSection />
      </section>
    </div>
  )
}

export default DashboardPage
