import { Navigation, Clock, Activity } from 'lucide-react'

function JourneyTimelineProgress({ train }) {
  if (!train) return null

  // Journey metrics (defaulting to clean mock progress for active route display)
  const percentComplete = 62
  const currentStation = 'Mandya'
  const nextStation = 'Ramanagara'
  const etaMinutes = '20 Minutes'

  return (
    <div className="w-full bg-white/90 dark:bg-[#111936]/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-md shadow-blue-500/5 space-y-4">
      
      {/* Title & Percentage Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Journey Progress
            </h2>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Live status on route
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono font-black text-xs border border-blue-200/60 dark:border-blue-800/60">
          <span>{percentComplete}% Complete</span>
        </div>
      </div>

      {/* Modern Gradient Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60 relative">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-full transition-all duration-500 relative"
            style={{ width: `${percentComplete}%` }}
          >
            {/* Animated shimmer on progress bar */}
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Grid Display: Current, Next, ETA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        
        {/* Current Station */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Current Station</span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white truncate">
            {currentStation}
          </div>
        </div>

        {/* Next Station */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Next Station</span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white truncate">
            {nextStation}
          </div>
        </div>

        {/* ETA */}
        <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>ETA</span>
          </div>
          <div className="text-sm font-black text-blue-700 dark:text-blue-300">
            {etaMinutes}
          </div>
        </div>

      </div>

    </div>
  )
}

export default JourneyTimelineProgress
