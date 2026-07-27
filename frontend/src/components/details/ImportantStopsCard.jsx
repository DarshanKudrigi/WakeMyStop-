import { forwardRef } from 'react'
import { Train, Pencil } from 'lucide-react'

// All official stopping stations along the route
const officialRouteStops = [
  { name: 'MYSURU JN', code: 'MYS', schArr: '--', actArr: '--', schDep: '07:40 PM', actDep: '07:46 PM', distance: '0.0 km', platform: 'PF 5', isPassed: true, dayLabel: 'DAY 1 • 27 JUL' },
  { name: 'NAGANAHALLI', code: 'NHY', schArr: '07:51 PM', actArr: '07:52 PM', schDep: '07:52 PM', actDep: '07:58 PM', distance: '9.0 km', platform: 'PF 1', isPassed: true },
  { name: 'PANDAVAPURA', code: 'PANP', schArr: '08:02 PM', actArr: '08:04 PM', schDep: '08:03 PM', actDep: '08:11 PM', distance: '20.0 km', platform: 'PF 1', isPassed: true },
  { name: 'YELIYUR', code: 'Y', schArr: '08:19 PM', actArr: '08:23 PM', schDep: '08:20 PM', actDep: '08:28 PM', distance: '38.0 km', platform: 'PF 2', isPassed: true },
  { name: 'MANDYA', code: 'MYA', schArr: '08:27 PM', actArr: '08:33 PM', schDep: '08:29 PM', actDep: '08:35 PM', distance: '45.0 km', platform: 'PF 3', isPassed: true },
  { name: 'HANAKERE', code: 'HNK', schArr: '08:37 PM', actArr: '08:43 PM', schDep: '08:37 PM', actDep: '08:43 PM', distance: '55.5 km', platform: 'PF 1', isPassed: true },
  { name: 'MADDUR', code: 'MAD', schArr: '08:45 PM', actArr: '08:50 PM', schDep: '08:46 PM', actDep: '08:57 PM', distance: '65.0 km', platform: 'PF 2', isPassed: true },
  { name: 'CHANNAPATNA', code: 'CPT', schArr: '09:00 PM', actArr: '09:13 PM', schDep: '09:01 PM', actDep: '09:15 PM', distance: '83.0 km', platform: 'PF 3', isPassed: true },
  { name: 'RAMANAGARAM', code: 'RMGM', schArr: '09:11 PM', actArr: '09:24 PM', schDep: '09:12 PM', actDep: '09:24 PM', distance: '94.0 km', platform: 'PF 2', isPassed: true },
  { name: 'BIDADI', code: 'BID', schArr: '09:22 PM', actArr: '09:34 PM', schDep: '09:23 PM', actDep: '09:35 PM', distance: '109.0 km', platform: 'PF 2', isCurrent: true, isPassed: false, delayMinutes: 12 },
  { name: 'HEJJALA', code: 'HJL', schArr: '09:29 PM', actArr: '09:41 PM', schDep: '09:30 PM', actDep: '09:42 PM', distance: '115.0 km', platform: 'PF 2', isPassed: false },
  { name: 'KENGERI', code: 'KGI', schArr: '09:40 PM', actArr: '09:52 PM', schDep: '09:41 PM', actDep: '09:53 PM', distance: '126.0 km', platform: 'PF 2', isPassed: false },
  { name: 'KSR BENGALURU', code: 'SBC', schArr: '09:55 PM', actArr: '10:10 PM', schDep: '--', actDep: '--', distance: '138.0 km', platform: 'PF 10', isPassed: false },
]

const ImportantStopsCard = forwardRef(function ImportantStopsCard({ train }, ref) {
  const stops = officialRouteStops

  return (
    <div id="train-route-section" className="w-full bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-sm space-y-4">
      
      {/* Day 1 Top Header Divider (Centered pill with smooth line) */}
      <div className="flex items-center justify-center my-3 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <span className="relative px-4 py-1 bg-slate-50 dark:bg-slate-800 text-[11px] font-black text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs uppercase tracking-wider">
          DAY 1 • 27 JUL
        </span>
      </div>

      {/* Column Titles */}
      <div className="grid grid-cols-12 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 px-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="col-span-3 text-left">Arrival</div>
        <div className="col-span-6 text-left pl-14 sm:pl-16">Station & Track</div>
        <div className="col-span-3 text-right">Departure</div>
      </div>

      {/* Railway Track Station Rows */}
      <div className="relative space-y-0 py-1">
        {stops.map((stop) => {
          const isCurrent = stop.isCurrent

          return (
            <div key={stop.code + stop.name}>
              
              {/* Render Day 2 separator ONLY if the station actually crosses midnight */}
              {stop.dayLabel && stop.dayLabel.includes('DAY 2') ? (
                <div className="flex items-center justify-center my-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <span className="relative px-4 py-1 bg-slate-50 dark:bg-slate-800 text-[11px] font-black text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs uppercase tracking-wider">
                    {stop.dayLabel}
                  </span>
                </div>
              ) : null}

              {/* Station Row Layout */}
              <div
                ref={isCurrent ? ref : null}
                className={`relative grid grid-cols-12 items-center py-3.5 px-2 transition-colors ${
                  isCurrent ? 'scroll-mt-28' : ''
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
                      {stop.actArr !== stop.schArr ? (
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

                  {/* Station Name & Grouped Distance + Platform Badge (Line 1: Name, Line 2: Distance • Platform) */}
                  <div className="min-w-0">
                    {/* Line 1: Station Name */}
                    <h3 className={`text-xs sm:text-sm font-black uppercase tracking-tight truncate ${
                      isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {stop.name}
                    </h3>

                    {/* Line 2: Distance • Platform Badge (Grouped Together) */}
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
                      {stop.actDep !== stop.schDep ? (
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

    </div>
  )
})

export default ImportantStopsCard
