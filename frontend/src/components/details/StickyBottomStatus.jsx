import { useState, useEffect } from 'react'
import { RefreshCw, Navigation, Trash2 } from 'lucide-react'

function StickyBottomStatus({
  train,
  onRefreshClick,
  isRefreshing,
  onConfirmClick,
  onCancelClick,
  visible,
  isJourneyConfirmed,
}) {
  // Live seconds elapsed since last update
  const [secondsAgo, setSecondsAgo] = useState(3)

  // Manual refresh countdown cooldown (15 seconds lockout)
  const [cooldown, setCooldown] = useState(0)

  // 1. Auto-increment seconds counter every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 2. Auto-refresh every 15 seconds
  useEffect(() => {
    const autoRefreshTimer = setInterval(() => {
      setSecondsAgo(0)
      if (onRefreshClick) onRefreshClick()
    }, 15000)
    return () => clearInterval(autoRefreshTimer)
  }, [onRefreshClick])

  // 3. Cooldown countdown timer when manual refresh is clicked
  useEffect(() => {
    if (cooldown <= 0) return
    const cdTimer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(cdTimer)
  }, [cooldown])

  const handleManualRefresh = () => {
    if (cooldown > 0 || isRefreshing) return
    setSecondsAgo(0)
    setCooldown(15) // Lock out manual refresh for 15s
    if (onRefreshClick) onRefreshClick()
  }

  if (!train) return null

  const progressPercent = 68
  const remainingDistance = '46 km'

  return (
    <div
      className={`fixed bottom-3 left-0 right-0 z-40 px-3 sm:px-4 transition-all duration-300 transform ease-in-out ${
        visible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-4xl mx-auto w-full relative">
        
        {/* Floating "In Train?" Button (Attached to top-right edge above footer) */}
        <div className="absolute -top-7 right-4 sm:right-6 z-50">
          <button
            type="button"
            title="Live crowd-sourced tracking (Coming Soon)"
            className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#161c26] text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-lg border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>In Train?</span>
          </button>
        </div>

        {/* Card-Width Bounded Compact Sticky Footer Sheet */}
        <div className="w-full bg-white/95 dark:bg-[#12161f]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl rounded-2xl p-3.5 sm:p-4">
          
          {isJourneyConfirmed ? (
            /* MODE 2: SIMPLIFIED ACTIVE JOURNEY FOOTER */
            <div className="space-y-3">
              
              {/* Row 1: Large Progress Bar, Percentage & Remaining Distance */}
              <div className="flex items-center justify-between gap-4 text-xs font-black">
                
                {/* Progress Bar & Percentage */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-slate-900 dark:text-white uppercase tracking-wider">Journey Progress</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Remaining Distance Metric Only */}
                <div className="shrink-0 text-right pl-2 border-l border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Remaining</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">{remainingDistance}</span>
                </div>

              </div>

              {/* Row 2: Bottom Actions & Live Timestamp */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                
                {/* LEFT: Refresh Icon + Live "Updated X seconds ago" / 15s Countdown */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={cooldown > 0 || isRefreshing}
                    title={cooldown > 0 ? `Refresh available in ${cooldown}s` : 'Refresh status'}
                    className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer border ${
                      cooldown > 0
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>

                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {cooldown > 0 ? `Wait ${cooldown}s` : `Updated ${secondsAgo}s ago`}
                  </span>
                </div>

                {/* RIGHT: Cancel Journey Button */}
                <button
                  type="button"
                  onClick={onCancelClick}
                  className="py-1.5 px-3.5 rounded-xl border border-rose-500/80 hover:border-rose-600 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Journey</span>
                </button>
              </div>

            </div>
          ) : (
            /* MODE 1: PLANNING FOOTER MODE */
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {train.isDelayed ? 'Arrived at MANDYA' : 'Left MYSURU JN at 07:40 PM'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${
                    train.isDelayed
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {train.isDelayed ? `${train.delayMinutes || 8} min delay` : 'On Time'}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {cooldown > 0 ? `Wait ${cooldown}s` : `Updated ${secondsAgo}s ago`}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={cooldown > 0 || isRefreshing}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">{cooldown > 0 ? `${cooldown}s` : 'Refresh'}</span>
                </button>

                <button
                  type="button"
                  onClick={onConfirmClick}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Confirm Journey</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default StickyBottomStatus
