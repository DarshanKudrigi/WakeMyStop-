import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
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
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Clock,
  Volume2,
} from 'lucide-react'
import { useJourney } from '../../context/JourneyContext'

function NavigationDrawer({ isOpen, onClose, onLogout }) {
  const navigate = useNavigate()
  const { activeJourney, cancelJourney } = useJourney()

  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

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

  const handleOpenManageJourney = (e) => {
    e.preventDefault()
    onClose()
    setIsManageModalOpen(true)
  }

  const handleConfirmCancel = () => {
    cancelJourney()
    setIsCancelConfirmOpen(false)
    setIsManageModalOpen(false)
  }

  if (!isOpen && !isManageModalOpen && !isCancelConfirmOpen) return null

  return (
    <>
      {/* ChatGPT-style Slide Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Blurred / Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex z-50">
            <aside className="w-80 max-w-[85vw] bg-white dark:bg-[#161c26] shadow-2xl border-r border-slate-200 dark:border-slate-800/80 p-5 flex flex-col justify-between transform transition-transform duration-300 ease-out animate-in slide-in-from-left">
              
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
                  <NavLink
                    to="/dashboard"
                    end
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </NavLink>

                  <NavLink
                    to="/journeys"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Train className="w-5 h-5" />
                    <span>My Journeys</span>
                  </NavLink>

                  {/* MANAGE JOURNEY (Sidebar Item) */}
                  <a
                    href="#manage-journey"
                    onClick={handleOpenManageJourney}
                    className="flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div className="flex items-center justify-between w-full">
                      <span>Manage Journey</span>
                      {activeJourney && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                  </a>

                  <NavLink
                    to="/notifications"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </NavLink>

                  <NavLink
                    to="/feedback"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Feedback</span>
                  </NavLink>

                  <NavLink
                    to="/profile"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </NavLink>

                  <NavLink
                    to="/settings"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </NavLink>
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
      )}

      {/* MANAGE JOURNEY MODAL */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#161c26] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Manage Journey
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeJourney ? (
              <div className="space-y-4">
                
                {/* 1. Current Journey Overview */}
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">Current Journey</span>
                  
                  <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                    <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-mono text-[11px]">#{activeJourney.trainNo}</span>
                    <span className="truncate">{activeJourney.trainName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 font-bold text-slate-700 dark:text-slate-300">
                    <span>{activeJourney.from} → {activeJourney.to}</span>
                  </div>
                </div>

                {/* 2. Alert Preferences Summary */}
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">Alert Preferences</span>
                  
                  <div className="space-y-1.5 pt-1 text-slate-700 dark:text-slate-300 font-bold">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Notify Before:
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">{activeJourney.preferences?.notifyTime || '30 Minutes'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        Alarm Sound:
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">{activeJourney.preferences?.soundType || 'Train Horn'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Journey Status */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">Journey Status:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Active - Monitoring Route
                  </span>
                </div>

                {/* 4. Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsManageModalOpen(false)
                      navigate(`/train/${activeJourney.trainNo}`)
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Train className="w-4 h-4" />
                    <span>View Journey Tracking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCancelConfirmOpen(true)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-black text-xs border border-rose-200 dark:border-rose-800 cursor-pointer flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Cancel Journey</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  No active journey is currently being monitored.
                </p>
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(false)}
                  className="py-2 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CANCEL JOURNEY CONFIRMATION DIALOG */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#161c26] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cancel Journey?
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Are you sure? This will stop journey monitoring and remove your alert preferences.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-200 cursor-pointer"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                Yes, Cancel Journey
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default NavigationDrawer
