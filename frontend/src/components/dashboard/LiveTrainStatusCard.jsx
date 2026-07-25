import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Search, Train, ArrowRight } from 'lucide-react'

function LiveTrainStatusCard() {
  const navigate = useNavigate()
  const [trainQuery, setTrainQuery] = useState('12609 - Wodeyar Express')

  const handleSearch = (e) => {
    e.preventDefault()
    if (!trainQuery.trim()) return

    // Extract train number if formatted like "12609 - Wodeyar Express"
    const numberPart = trainQuery.includes('-')
      ? trainQuery.split('-')[0].trim()
      : trainQuery.trim()

    // Navigate to dedicated Live Status / Journeys page without inline output
    navigate(`/journeys?train=${encodeURIComponent(numberPart)}`)
  }

  return (
    <div className="w-full bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-lg shadow-blue-500/5 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-black shadow-md shadow-emerald-500/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>🚆 Live Train Status</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Search by train number or train name for real-time running status
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Live GPS
        </span>
      </div>

      {/* Input & Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Search by Train Number OR Train Name
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Train className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={trainQuery}
                onChange={(e) => setTrainQuery(e.target.value)}
                placeholder="Enter Train Number or Name (e.g. 12609 or Wodeyar Express)"
                className="w-full pl-12 pr-4 py-4 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>Check Status</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LiveTrainStatusCard
