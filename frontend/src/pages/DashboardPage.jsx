import { useJourney } from '../context/JourneyContext'
import CurrentJourneyCard from '../components/dashboard/CurrentJourneyCard'
import TrainSearchCard from '../components/dashboard/TrainSearchCard'
import LiveTrainStatusCard from '../components/dashboard/LiveTrainStatusCard'
import FeaturesSection from '../components/dashboard/FeaturesSection'

function DashboardPage() {
  const { activeJourney, completeJourney } = useJourney()

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Active Journey Ticket Card (ONLY shown when user has a confirmed active journey) */}
      {activeJourney ? (
        <CurrentJourneyCard
          journey={activeJourney}
          onCompleteJourney={completeJourney}
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
