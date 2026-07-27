import { CheckCircle, ArrowLeft, Bell } from 'lucide-react'

function ConfirmJourneyCard({ train, hasActiveJourney, onConfirmClick, onBackClick }) {
  if (!train) return null

  return (
    <div className="w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-500/30 space-y-6 relative overflow-hidden">
      
      {/* Glow effect background element */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        
        {/* Left Info: Icon + Title + Subtitle */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-xs border border-blue-400/30">
            <Bell className="w-3.5 h-3.5" />
            <span>AI Station Alarm Alert</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Ready to Track This Journey?
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed">
            RailAlert AI will monitor your journey in real-time with live GPS tracking and sound a loud alarm before your destination.
          </p>

          {hasActiveJourney && (
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-2">
              <span>⚠️ You currently have an active journey in progress. Confirming will replace it.</span>
            </div>
          )}
        </div>

        {/* Right Actions: Primary (Confirm) & Secondary (Back) */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
          
          {/* Secondary Button */}
          <button
            type="button"
            onClick={onBackClick}
            className="py-3 px-5 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-colors cursor-pointer border border-white/20 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Train Results</span>
          </button>

          {/* Primary Button */}
          <button
            type="button"
            onClick={onConfirmClick}
            className="py-3 px-6 min-h-[44px] rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Confirm Journey</span>
          </button>

        </div>

      </div>
    </div>
  )
}

export default ConfirmJourneyCard
