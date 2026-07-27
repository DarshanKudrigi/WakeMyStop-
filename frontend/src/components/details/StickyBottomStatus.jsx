import { RefreshCw, CheckCircle, Navigation } from 'lucide-react'

function StickyBottomStatus({ train, onRefreshClick, isRefreshing, onConfirmClick, visible, isJourneyConfirmed }) {
  if (!train || !visible) return null

  const contextualStatus = train.isDelayed
    ? `At MANDYA`
    : `Reached MANDYA at 08:29 PM`
  
  const delayText = train.isDelayed ? `${train.delayMinutes || 12} min delay` : 'On Time'
  const progressPercent = 68

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 px-3 sm:px-4 pointer-events-none">
      <div className="max-w-4xl mx-auto w-full relative pointer-events-auto">
        
        {/* Floating "In Train?" Button (Attached to top-right edge above footer, offset so it never overlaps Confirm button) */}
        <div className="absolute -top-4 right-4 sm:right-6 z-50">
          <button
            type="button"
            title="Live crowd-sourced tracking (Coming Soon)"
            className="px-3.5 py-1 rounded-full bg-white dark:bg-[#111936] text-slate-800 dark:text-slate-100 font-black text-xs shadow-lg border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>In Train?</span>
          </button>
        </div>

        {/* Card-Width Bounded Sticky Footer Container */}
        <div className="w-full bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl rounded-3xl p-4 sm:p-5 transition-all duration-300 animate-in slide-in-from-bottom-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Left Side: Contextual Status Message + Dark Red Delay Badge */}
            <div className="flex items-center gap-2.5 flex-wrap min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                {contextualStatus}
              </span>
              
              {/* Dark Red Delay Pill */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                train.isDelayed
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
              }`}>
                {delayText}
              </span>
            </div>

            {/* Center: Journey Progress (Rendered ONLY AFTER Confirmation) */}
            {isJourneyConfirmed && (
              <div className="space-y-1 w-full sm:w-52 shrink-0">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-700 dark:text-slate-300">Journey Progress</span>
                  <span className="text-blue-600 dark:text-blue-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Right Side: Refresh & Confirm Actions (Always Right-Aligned) */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              
              {/* Refresh Button */}
              <button
                type="button"
                onClick={onRefreshClick}
                disabled={isRefreshing}
                title="Refresh Status"
                className="py-2 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 min-h-[38px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">Refresh</span>
              </button>

              {/* Confirm Journey Button */}
              <button
                type="button"
                onClick={onConfirmClick}
                className="py-2 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px]"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Journey</span>
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default StickyBottomStatus
