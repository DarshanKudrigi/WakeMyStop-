import { useNavigate } from 'react-router-dom'
import { Train, ArrowRight, Clock, MapPin, Ticket, ShieldCheck, CheckCircle } from 'lucide-react'

function CurrentJourneyCard({ journey, onCompleteJourney }) {
  const navigate = useNavigate()

  // Default active journey data if passed via prop or fallback
  const current = journey || {
    id: '12609',
    trainName: '12609 - Wodeyar Express',
    from: 'Bengaluru Cantt (BNC)',
    to: 'Mysuru Junction (MYS)',
    eta: 'In 45 mins (06:30 PM)',
    status: 'Live GPS Tracking',
    delay: 'On Time (0 min delay)',
  }

  // Extract train number if combined in trainName string
  const trainNo = current.id || current.trainName.split('-')[0]?.trim() || '12609'
  const trainNameOnly = current.trainName.includes('-')
    ? current.trainName.split('-').slice(1).join('-').trim()
    : current.trainName

  const handleComplete = () => {
    try {
      localStorage.removeItem('railalert_active_journey')
    } catch {
      // Ignore
    }
    if (onCompleteJourney) {
      onCompleteJourney()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-blue-600/15 hover:shadow-2xl hover:shadow-blue-600/20 transition-all duration-300 overflow-hidden border border-blue-500/20">
      
      {/* Decorative Ticket Cutout Notches */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#0b132b] pointer-events-none hidden sm:block" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#0b132b] pointer-events-none hidden sm:block" />

      {/* Background Graphic */}
      <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
        <Train className="w-56 h-56 text-white" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left: Train Ticket Details */}
        <div className="space-y-3.5 flex-1">
          {/* Header Row: Live status, Delay & Ticket Tag */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>{current.status}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Current Delay: {current.delay || 'On Time (0 min delay)'}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
              <Ticket className="w-3 h-3" />
              <span>Active Ticket</span>
            </span>
          </div>

          {/* Train Number & Name */}
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-white/15 text-white font-mono text-sm font-bold border border-white/20">
              #{trainNo}
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              {trainNameOnly}
            </h2>
          </div>

          {/* Source -> Destination & ETA */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs md:text-sm text-blue-100 font-medium pt-1">
            <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-xl border border-white/10">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold text-white">{current.from}</span>
              <span className="text-blue-300 font-bold">→</span>
              <span className="font-semibold text-white">{current.to}</span>
            </div>

            {/* ETA with Helper Explanation */}
            <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <span>ETA: <strong className="text-white font-bold">{current.eta}</strong></span>
                <span className="block text-[10px] text-blue-200 opacity-90 leading-tight">
                  (Expected Time of Arrival)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Perforated Divider for Desktop */}
        <div className="hidden md:block w-px h-24 border-r-2 border-dashed border-white/20 my-auto" />

        {/* Right: Actions (Manage Journey & Complete Journey) */}
        <div className="pt-2 md:pt-0 shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 items-stretch">
          <button
            type="button"
            onClick={() => navigate('/journeys')}
            className="py-3 px-6 rounded-2xl bg-white text-blue-800 hover:bg-blue-50 font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Manage Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleComplete}
            className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Complete current journey to allow booking a new journey"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>Complete Journey</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default CurrentJourneyCard
