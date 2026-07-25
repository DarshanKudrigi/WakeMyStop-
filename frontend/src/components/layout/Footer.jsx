import { Link } from 'react-router-dom'
import { Train, ShieldCheck, Heart } from 'lucide-react'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-white dark:bg-[#0b132b] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Summary Column */}
          <div className="md:col-span-5 space-y-3">
            <Link to="/dashboard" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Train className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                RailAlert <span className="text-blue-600 dark:text-blue-400">AI</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm font-normal leading-relaxed">
              Your intelligent AI travel assistant that ensures you never miss a station with live GPS tracking, route delay predictions, and loud destination alarms.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/journeys" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  My Journeys
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Notification Center
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Send Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Legal & Safety
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <span className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms & Conditions
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Status Bar */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <span>
              Disclaimer: RailAlert is an independent crowd-powered platform. We are not affiliated with Indian Railways, IRCTC, or NTES.
              <br />
              <br />
              © {currentYear} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>AI GPS Tracking Active</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
