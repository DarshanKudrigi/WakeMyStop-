import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { mockTrains } from '../data/trainsData'

function TrainDetailsPage() {
  const { trainNo } = useParams()
  const train = mockTrains.find((t) => t.trainNo === trainNo) || mockTrains[0]

  // Check if active journey already exists
  const hasActiveJourney = typeof window !== 'undefined' && localStorage.getItem('railalert_active_journey') !== null

  return (
    <div className="w-full space-y-6">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          to="/journeys"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search Results</span>
        </Link>
      </div>

      {/* Train Details Card */}
      <div className="w-full bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-lg shadow-blue-500/5 space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-black text-sm">
                #{train.trainNo}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {train.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {train.trainName}
            </h1>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            {train.status}
          </span>
        </div>

        {/* Route Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase text-slate-400">Departure</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{train.departureTime}</div>
            <div className="font-semibold text-slate-700 dark:text-slate-300">{train.from} ({train.fromCode})</div>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase text-slate-400">Arrival</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{train.arrivalTime}</div>
            <div className="font-semibold text-slate-700 dark:text-slate-300">{train.to} ({train.toCode})</div>
          </div>
        </div>

        {/* One Active Journey Warning Notice */}
        {hasActiveJourney ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            ⚠️ You already have an active journey. Complete or cancel it before starting another journey.
          </div>
        ) : null}

        {/* Confirm Journey Button (Disabled if active journey exists) */}
        <div className="pt-2">
          <button
            type="button"
            disabled={hasActiveJourney}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-black text-base shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Confirm Journey & Configure Notifications
          </button>
        </div>

      </div>
    </div>
  )
}

export default TrainDetailsPage
