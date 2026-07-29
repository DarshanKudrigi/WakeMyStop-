import { Navigation, Clock, Activity } from 'lucide-react'

function JourneyTimelineProgress({ train }) {
  if (!train) return null

  // Journey metrics
  const percentComplete = 68
  const currentStation = 'Mandya'
  const nextStation = 'Ramanagara'
  const expectedTime = '09:12 PM'

  return (
    <div className="w-full bg-white/95 dark:bg-[#161c26]/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm space-y-3">
      
      {/* Title & Prominent Percentage Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Journey Progress
          </span>
        </div>

        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono font-black text-sm border border-blue-200/60 dark:border-blue-800/60">
          <span>{percentComplete}% Completed</span>
        </div>
      </div>

      {/* Prominent Main Focus Progress Bar */}
      <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* Clean 3-Column Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs">
        
        {/* Current Station */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">Current</span>
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white truncate">
            {currentStation}
          </div>
        </div>

        {/* Next Station */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">Next</span>
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white truncate">
            {nextStation}
          </div>
        </div>

        {/* Expected Arrival */}
        <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 space-y-0.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">Arrival</span>
          </div>
          <div className="text-xs font-black text-blue-700 dark:text-blue-300 truncate">
            {expectedTime}
          </div>
        </div>

      </div>

    </div>
  )
}

export default JourneyTimelineProgress
