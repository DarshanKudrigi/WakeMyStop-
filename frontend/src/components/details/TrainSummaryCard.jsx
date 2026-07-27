import { ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'

function TrainSummaryCard({ train, onConfirmClick }) {
  if (!train) return null

  const isDelayed = train.isDelayed
  const statusBadgeColor = isDelayed
    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'

  const totalDistance = train.distance || '138 km'

  return (
    <div className="w-full bg-white/95 dark:bg-[#111936]/95 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm space-y-3">
      
      {/* Row 1 (Top): Train No, Train Name, Delay Status Badge (Top Right) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-black text-xs sm:text-sm shadow-xs">
            #{train.trainNo}
          </span>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {train.trainName}
          </h1>
        </div>

        {/* Delay Status Badge (Top-Right) */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${statusBadgeColor}`}>
          {isDelayed ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>{train.status}</span>
        </span>
      </div>

      {/* Row 2 (Bottom): Route (From → To) & Total Distance + Confirm Button */}
      <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        
        {/* Route & Total Distance */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
            <span>{train.from}</span>
            <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{train.to}</span>
          </div>

          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Total Distance: <strong className="text-slate-700 dark:text-slate-300 font-extrabold">{totalDistance}</strong>
          </div>
        </div>

        {/* Confirm Journey Button */}
        <button
          type="button"
          onClick={onConfirmClick}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 shrink-0 min-h-[40px]"
        >
          <ShieldCheck className="w-4 h-4 text-blue-100" />
          <span>Confirm Journey</span>
        </button>

      </div>

    </div>
  )
}

export default TrainSummaryCard
