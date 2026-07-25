import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  X,
  LayoutDashboard,
  Train,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'My Journeys', to: '/journeys', icon: Train },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Feedback', to: '/feedback', icon: MessageSquare },
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Settings', to: '/settings', icon: Settings },
]

function NavigationDrawer({ isOpen, onClose, onLogout }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Blurred / Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ChatGPT-style Slide Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-full flex z-50">
        <aside className="w-80 max-w-[85vw] bg-white dark:bg-[#111936] shadow-2xl border-r border-slate-200 dark:border-slate-800/80 p-5 flex flex-col justify-between transform transition-transform duration-300 ease-out animate-in slide-in-from-left">
          
          <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                  <Train className="w-4 h-4" />
                </div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  RailAlert <span className="text-blue-600 dark:text-blue-400">AI</span>
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Navigation Links */}
            <nav className="space-y-1.5" aria-label="Navigation drawer menu">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.exact}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Drawer Footer */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700/60 text-xs">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>AI Travel Assistant</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Set smart destination alarms and track real-time routes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose()
                if (onLogout) onLogout()
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

        </aside>
      </div>
    </div>
  )
}

export default NavigationDrawer
