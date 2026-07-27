import { RefreshCw, Radio, Clock } from 'lucide-react'

function LiveStatusCard({ train, onRefreshClick, isRefreshing, lastUpdated }) {
  if (!train) return null

  const isDelayed = train.isDelayed
  const delayText = isDelayed ? `Delayed by ${train.delayMinutes || 12} Mins` : 'Running On Time'

  return (
    <div className="w-full bg-white/90 dark:bg-[#111936]/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      
      {/* Left: Status Badge & Last Updated */}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-2xl shrink-0 ${
          isDelayed ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        }`}>
          <Radio className="w-5 h-5 animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
              isDelayed
                ? 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            }`}>
              {delayText}
            </span>
          </div>

          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Last Updated: {lastUpdated || '10 seconds ago'}</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Refresh Status Button */}
      <button
        type="button"
        onClick={onRefreshClick}
        disabled={isRefreshing}
        className="w-full sm:w-auto py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 min-h-[40px]"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>{isRefreshing ? 'Updating...' : 'Refresh Status'}</span>
      </button>

    </div>
  )
}

export default LiveStatusCard
