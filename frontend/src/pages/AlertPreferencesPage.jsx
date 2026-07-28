import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Pause, CheckCircle2, Info } from 'lucide-react'
import { mockTrains } from '../data/trainsData'

function AlertPreferencesPage() {
  const { trainNo } = useParams()
  const navigate = useNavigate()

  const train = mockTrains.find((t) => t.trainNo === trainNo) || mockTrains[0]

  // Essential ON/OFF Toggle States
  const [preferences, setPreferences] = useState({
    enableNotifications: true,
    messageNotification: true,
    phoneCallAlert: false,
    alarmSound: true,
    vibration: true,
    notifyTime: '30 Minutes',
    soundType: 'Train Horn',
  })

  // Sample sound player preview state
  const [isPlayingSample, setIsPlayingSample] = useState(false)

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handlePlaySample = () => {
    setIsPlayingSample(true)
    setTimeout(() => {
      setIsPlayingSample(false)
    }, 2500)
  }

  const handleConfirmAndStart = () => {
    // Pure UI Navigation - Next step in journey flow
    navigate(`/journey/active/${train.trainNo}`)
  }

  const handleBack = () => {
    navigate(`/train/${train.trainNo}`)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-24 px-3 sm:px-4 pt-2">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Train Details</span>
        </button>
      </div>

      {/* 1. TOP CARD: JOURNEY SUMMARY */}
      <div className="bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
        
        {/* Train Badge & Train Name */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-black text-xs shadow-xs shrink-0">
            {train.trainNo}
          </span>
          <h1 className="text-base font-black text-slate-900 dark:text-white truncate">
            {train.trainName}
          </h1>
        </div>

        {/* Compact Trip Details (From, To, Total Distance) */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">From</span>
            <span className="font-black text-slate-900 dark:text-white block truncate">{train.from}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">To</span>
            <span className="font-black text-slate-900 dark:text-white block truncate">{train.to}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Total Distance</span>
            <span className="font-black text-slate-900 dark:text-white block">{train.totalDistance || '138 km'}</span>
          </div>
        </div>

      </div>

      {/* 2. ALERT PREFERENCES (5 Essential ON/OFF Toggle Switches) */}
      <div className="bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
          Alert Preferences
        </h2>

        <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800/60">
          
          {/* Toggle 1: Enable Notifications */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block">Enable Notifications</span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('enableNotifications')}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative cursor-pointer ${
                preferences.enableNotifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  preferences.enableNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Message Notification (SMS / WhatsApp) */}
          <div className="flex items-center justify-between pt-3.5">
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block">Message Notification</span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">SMS / WhatsApp alert messages</span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('messageNotification')}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative cursor-pointer ${
                preferences.messageNotification ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  preferences.messageNotification ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Phone Call Alert */}
          <div className="flex items-center justify-between pt-3.5">
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block">Phone Call Alert</span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('phoneCallAlert')}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative cursor-pointer ${
                preferences.phoneCallAlert ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  preferences.phoneCallAlert ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 4: Alarm Sound */}
          <div className="flex items-center justify-between pt-3.5">
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block">Alarm Sound</span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('alarmSound')}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative cursor-pointer ${
                preferences.alarmSound ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  preferences.alarmSound ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 5: Vibration */}
          <div className="flex items-center justify-between pt-3.5">
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block">Vibration</span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('vibration')}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative cursor-pointer ${
                preferences.vibration ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  preferences.vibration ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

      </div>

      {/* 3. DROPDOWNS: NOTIFY BEFORE DESTINATION & ALARM SOUND */}
      <div className="bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
        
        {/* Dropdown 1: Notify Before Destination (20m, 30m, 40m) */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-900 dark:text-white block">
            Notify Before Destination
          </label>
          <select
            value={preferences.notifyTime}
            onChange={(e) => setPreferences((prev) => ({ ...prev, notifyTime: e.target.value }))}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-extrabold text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="20 Minutes">20 Minutes</option>
            <option value="30 Minutes">30 Minutes</option>
            <option value="40 Minutes">40 Minutes</option>
          </select>
        </div>

        {/* Dropdown 2: Alarm Sound + Play Sample Button */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-black text-slate-900 dark:text-white block">
            Alarm Sound
          </label>
          <select
            value={preferences.soundType}
            onChange={(e) => setPreferences((prev) => ({ ...prev, soundType: e.target.value }))}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-extrabold text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Train Horn">Train Horn</option>
            <option value="Soft Bell">Soft Bell</option>
            <option value="Classic Alarm">Classic Alarm</option>
            <option value="Digital Bell">Digital Bell</option>
          </select>

          {/* Small Secondary Play Sample Button */}
          <button
            type="button"
            onClick={handlePlaySample}
            disabled={isPlayingSample}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-[11px] transition-all cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 active:scale-95"
          >
            {isPlayingSample ? (
              <>
                <Pause className="w-3 h-3 text-blue-600 animate-pulse" />
                <span className="text-blue-600 dark:text-blue-400">Playing {preferences.soundType}...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-slate-600 dark:text-slate-300 fill-current" />
                <span>Play Sample</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* 4. BOTTOM DISCLAIMER NOTE */}
      <div className="flex items-center gap-2 px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>You can change these preferences later from Manage Journey.</span>
      </div>

      {/* 5. ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 text-center"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleConfirmAndStart}
          className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirm & Start Journey</span>
        </button>
      </div>

    </div>
  )
}

export default AlertPreferencesPage
