import { useState } from 'react'
import { Bell, Smartphone, MessageSquare, Mail, Radio, Clock, Check, Save } from 'lucide-react'
import { saveAlertPreferences } from '../../api/dashboardApi'

function AlertPreferencesCard() {
  const [methods, setMethods] = useState({
    mobileAlarm: true,
    sms: true,
    email: false,
    pushNotification: true,
  })

  const [timing, setTiming] = useState('15')
  const [loading, setLoading] = useState(false)
  const [savedStatus, setSavedStatus] = useState(false)

  const handleToggle = (key) => {
    setMethods((prev) => ({ ...prev, [key]: !prev[key] }))
    setSavedStatus(false)
  }

  const handleTimingChange = (value) => {
    setTiming(value)
    setSavedStatus(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await saveAlertPreferences({
        methods,
        alertTimeMinutes: parseInt(timing, 10),
      })
      setSavedStatus(true)
      setTimeout(() => {
        setSavedStatus(false)
      }, 3500)
    } finally {
      setLoading(false)
    }
  }

  const methodList = [
    { key: 'mobileAlarm', label: 'Mobile Alarm', icon: Smartphone, desc: 'Loud arrival alarm' },
    { key: 'sms', label: 'SMS', icon: MessageSquare, desc: 'Text alert' },
    { key: 'email', label: 'Email', icon: Mail, desc: 'Email notification' },
    { key: 'pushNotification', label: 'Push Notification', icon: Bell, desc: 'Instant app alert' },
  ]

  const timingOptions = [
    { value: '5', label: '5 Mins Before' },
    { value: '10', label: '10 Mins Before' },
    { value: '15', label: '15 Mins Before' },
    { value: '20', label: '20 Mins Before' },
  ]

  return (
    <div className="bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Alert Preferences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure notification channels and arrival alarm timing</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Notification Methods */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Notification Methods
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {methodList.map(({ key, label, icon: Icon, desc }) => {
                const active = methods[key]
                return (
                  <div
                    key={key}
                    onClick={() => handleToggle(key)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      active
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80 text-slate-900 dark:text-white'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${active ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{desc}</div>
                      </div>
                    </div>

                    {/* Switch */}
                    <div
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                        active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                          active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Alert Time */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Alert Time
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {timingOptions.map((opt) => {
                const selected = timing === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTimingChange(opt.value)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <Radio className={`w-3.5 h-3.5 ${selected ? 'text-white' : 'text-slate-400'}`} />
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Save & Continue Button */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save & Continue'}</span>
            </button>

            {savedStatus ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AlertPreferencesCard
