import { useNavigate } from 'react-router-dom'
import { Train, ArrowRight, MapPin, Calendar, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useJourney } from '../../context/JourneyContext'

function CurrentJourneyCard({ journey }) {
  const navigate = useNavigate()
  const { activeJourney } = useJourney()

  // Read active journey from props or global reactive context
  const active = journey || activeJourney

  if (!active) return null

  const handleViewJourney = () => {
    navigate(`/train/${active.trainNo}`)
  }

  const isDelayed = active.delayMinutes > 0

  return (
    <div className="w-full bg-gradient-to-r from-blue-50/90 via-indigo-50/75 to-blue-100/90 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 rounded-3xl border border-blue-200/90 dark:border-blue-800/60 p-5 sm:p-7 shadow-md space-y-5 relative overflow-hidden transition-all duration-300">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            My Active Journey
          </h2>
        </div>

        {/* Dynamic Delay Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
          isDelayed
            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
        }`}>
          {isDelayed ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>{active.status || 'Running On Time'}</span>
        </span>
      </div>

      {/* Train Info & Route Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Train Number Badge & Name */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-black text-xs shadow-xs shrink-0">
              {active.trainNo}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              {active.trainName}
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{active.date || 'Today, 28 Jul 2026'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Expected Time of Arrival: <strong className="text-slate-900 dark:text-white font-bold">09:12 PM</strong></span>
            </div>
          </div>
        </div>

        {/* Route Details: Source -> Destination */}
        <div className="flex items-center gap-3 bg-white/80 dark:bg-[#161c26]/80 px-4 py-2.5 rounded-2xl border border-blue-200/60 dark:border-slate-700/60 text-xs font-black shrink-0">
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{active.from}</span>
          </div>
          <span className="text-blue-600 dark:text-blue-400 font-extrabold">→</span>
          <div className="text-slate-900 dark:text-white">
            <span>{active.to}</span>
          </div>
        </div>

      </div>

      {/* Primary Action Button: View Journey */}
      <div className="pt-2 flex justify-end border-t border-blue-200/60 dark:border-slate-800/80">
        <button
          type="button"
          onClick={handleViewJourney}
          className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Train className="w-4 h-4" />
          <span>View Journey</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}

export default CurrentJourneyCard
