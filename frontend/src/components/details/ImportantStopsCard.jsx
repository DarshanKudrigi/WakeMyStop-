import { forwardRef } from 'react'
import { Train, Pencil } from 'lucide-react'

const ImportantStopsCard = forwardRef(function ImportantStopsCard({ train }, ref) {
  const rawStops = Array.isArray(train?.stops) ? train.stops : []

  const stops = rawStops.map((st, idx) => ({
    name: st.name || st.stationName || `Station ${idx + 1}`,
    code: st.code || st.stationCode || 'STN',
    schArr: st.schArr || '--',
    actArr: st.actArr || st.schArr || '--',
    schDep: st.schDep || '--',
    actDep: st.actDep || st.schDep || '--',
    distance: typeof st.distance === 'number' ? `${st.distance} km` : (st.distance || '0.0 km'),
    platform: st.platform || 'PF 1',
    isCurrent: st.status === 'current' || st.isCurrent || (train?.currentStation?.code === st.code),
    isPassed: st.status === 'departed' || st.isPassed,
  }))

  return (
    <div id="train-route-section" className="w-full bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-sm space-y-4">
      
      {/* Top Header Divider (Centered pill with smooth line) */}
      <div className="flex items-center justify-center my-3 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <span className="relative px-4 py-1 bg-slate-50 dark:bg-slate-800 text-[11px] font-black text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs uppercase tracking-wider">
          LIVE ROUTE TIMELINE
        </span>
      </div>

      {/* Column Titles */}
      <div className="grid grid-cols-12 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 px-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="col-span-3 text-left">Arrival</div>
        <div className="col-span-6 text-left pl-14 sm:pl-16">Station & Track</div>
        <div className="col-span-3 text-right">Departure</div>
      </div>

      {/* Railway Track Station Rows */}
      {stops.length > 0 ? (
        <div className="relative space-y-0 py-1">
          {stops.map((stop, idx) => {
            const isCurrent = stop.isCurrent
            const hasArrDelay = stop.actArr && stop.actArr !== '--' && stop.actArr !== stop.schArr
            const hasDepDelay = stop.actDep && stop.actDep !== '--' && stop.actDep !== stop.schDep

            return (
              <div key={`${stop.code}-${idx}`}>
                
                {/* Station Row Layout */}
                <div
                  ref={isCurrent ? ref : null}
                  className={`relative grid grid-cols-12 items-center py-3.5 px-2 transition-colors ${
                    isCurrent ? 'scroll-mt-28 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-200/60 dark:border-blue-800/40' : ''
                  }`}
                >
                  {/* Continuous Neutral Grey Railway Track */}
                  <div className="absolute left-[22%] sm:left-[23%] top-0 bottom-0 pointer-events-none flex justify-center items-center overflow-hidden z-0">
                    <svg className="w-9 h-full" preserveAspectRatio="none" viewBox="0 0 36 60">
                      <line x1="10" y1="0" x2="10" y2="60" stroke="currentColor" className="text-slate-400 dark:text-slate-600" strokeWidth="3" />
                      <line x1="26" y1="0" x2="26" y2="60" stroke="currentColor" className="text-slate-400 dark:text-slate-600" strokeWidth="3" />
                      
                      <line x1="6" y1="12" x2="30" y2="12" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="6" y1="30" x2="30" y2="30" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="6" y1="48" x2="30" y2="48" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Column 1: Arrival Time (Left) */}
                  <div className="col-span-3 text-left relative z-10 space-y-0.5">
                    {stop.schArr !== '--' ? (
                      <div>
                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                          {stop.schArr}
                        </div>
                        {hasArrDelay ? (
                          <div className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 font-mono pt-0.5">
                            {stop.actArr}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-slate-400">--</span>
                    )}
                  </div>

                  {/* Column 2: Station Node & Grouped Info (Center) */}
                  <div className="col-span-6 flex items-center gap-2 relative z-10 pl-2 sm:pl-3">
                    
                    {/* Track Marker Node */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      {isCurrent ? (
                        /* STATIC RailAlert Train Logo Badge */
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-[#111936]">
                          <Train className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        /* Orange Station Code Badge */
                        <div className="px-1.5 py-0.5 rounded-xs bg-amber-500 text-slate-950 font-mono font-black text-[10px] uppercase shadow-xs border border-amber-600 shrink-0">
                          {stop.code}
                        </div>
                      )}
                    </div>

                    {/* Thin Light-Gray Dashed Connector Line */}
                    <div className="w-3 sm:w-5 border-t border-dashed border-slate-300 dark:border-slate-700 shrink-0 opacity-80" />

                    {/* Station Name & Grouped Distance + Platform Badge */}
                    <div className="min-w-0">
                      <h3 className={`text-xs sm:text-sm font-black uppercase tracking-tight truncate ${
                        isCurrent ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-900 dark:text-white'
                      }`}>
                        {stop.name}
                      </h3>

                      <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>{stop.distance}</span>
                        {stop.platform && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 font-mono font-extrabold text-[11px]">
                              <span>{stop.platform}</span>
                              <Pencil className="w-2.5 h-2.5 opacity-60" />
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Column 3: Departure Time (Right) */}
                  <div className="col-span-3 text-right relative z-10 space-y-0.5">
                    {stop.schDep !== '--' ? (
                      <div>
                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                          {stop.schDep}
                        </div>
                        {hasDepDelay ? (
                          <div className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 font-mono pt-0.5">
                            {stop.actDep}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-slate-400">--</span>
                    )}
                  </div>

                </div>

              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs font-bold text-slate-400">
          Loading live route information...
        </div>
      )}

      {/* Route Termination END Marker */}
      <div id="route-end-marker" className="flex items-center justify-center pt-6 pb-2 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-slate-300 dark:border-slate-700" />
        </div>
        <span className="relative px-4 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black rounded-full border border-slate-700 dark:border-slate-300 shadow-md uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>END</span>
        </span>
      </div>

    </div>
  )
})

export default ImportantStopsCard
