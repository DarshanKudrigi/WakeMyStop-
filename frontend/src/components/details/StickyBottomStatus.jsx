import { RefreshCw, CheckCircle, Navigation } from 'lucide-react'

function StickyBottomStatus({ train, onRefreshClick, isRefreshing, onConfirmClick, visible, isJourneyConfirmed }) {
  if (!train) return null

  const contextualStatus = train.isDelayed
    ? `Arrived at MANDYA`
    : `Left MYSURU JN at 07:40 PM`
  
  const delayText = train.isDelayed ? `${train.delayMinutes || 8} min delay` : 'On Time'
  const progressPercent = 68

  return (
    <div
      className={`fixed bottom-3 left-0 right-0 z-40 px-3 sm:px-4 transition-all duration-300 transform ease-in-out ${
        visible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-4xl mx-auto w-full relative">
        
        {/* Floating "In Train?" Button (Attached to top-right edge above footer, matching RailRadar reference image) */}
        <div className="absolute -top-7 right-4 sm:right-6 z-50">
          <button
            type="button"
            title="Live crowd-sourced tracking (Coming Soon)"
            className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111936] text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-lg border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>In Train?</span>
          </button>
        </div>

        {/* Card-Width Bounded Sticky Footer Sheet */}
        <div className="w-full bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl rounded-3xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Left Side: Contextual Status Message, Delay Badge, & Neutral Gray Update Subtext */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                  {contextualStatus}
                </span>
                
                {/* Delay Pill */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                  train.isDelayed
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                }`}>
                  {delayText}
                </span>
              </div>

              {/* Smaller Neutral Gray Non-Intrusive Subtext */}
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Updated a few seconds ago
              </p>
            </div>

            {/* Center: Journey Progress (Rendered ONLY AFTER Confirmation) */}
            {isJourneyConfirmed && (
              <div className="space-y-1 w-full sm:w-48 shrink-0">
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
            <div className="flex items-center gap-3.5 sm:gap-4 shrink-0 self-end sm:self-auto">
              
              {/* Refresh Button */}
              <button
                type="button"
                onClick={onRefreshClick}
                disabled={isRefreshing}
                title="Refresh Status"
                className="py-2.5 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">Refresh</span>
              </button>

              {/* Primary Call-to-Action: Confirm Journey Button */}
              <button
                type="button"
                onClick={onConfirmClick}
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 min-h-[40px]"
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
