import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

function DatePickerModal({ isOpen, onClose, selectedDate, onSelectDate }) {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date()
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth())
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear())

  if (!isOpen) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  // Allow past and future month navigation freely
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  // Get total days in current month and starting day index
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()

  // Previous month trailing days
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()

  const calendarDays = []

  // Add trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isDisabled: true,
    })
  }

  // Add days of current month (all dates past, today, and future are selectable)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d)
    dateObj.setHours(0, 0, 0, 0)

    const isToday = dateObj.getTime() === today.getTime()
    const formattedStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isSelected = selectedDate === formattedStr

    calendarDays.push({
      day: d,
      isCurrentMonth: true,
      isDisabled: false,
      isToday,
      isSelected,
      dateStr: formattedStr,
    })
  }

  // Add leading days for next month to complete grid (up to 35 or 42 cells)
  const totalCells = Math.ceil(calendarDays.length / 7) * 7
  const nextDaysCount = totalCells - calendarDays.length
  for (let n = 1; n <= nextDaysCount; n++) {
    calendarDays.push({
      day: n,
      isCurrentMonth: false,
      isDisabled: true,
    })
  }

  const handleDateClick = (dayObj) => {
    if (dayObj.isDisabled || !dayObj.isCurrentMonth) return
    onSelectDate(dayObj.dateStr)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Calendar Modal Surface */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#111936] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 z-10">
        
        {/* Top Header Bar */}
        <div className="bg-blue-600 dark:bg-blue-700 px-5 py-3.5 flex items-center justify-between text-white">
          <h3 className="text-base font-extrabold tracking-tight">Select Date</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close date picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Body Container */}
        <div className="p-5">
          <div className="border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
            
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between mb-4 px-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {monthNames[currentMonth]} {currentYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Names Row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {dayNames.map((d) => (
                <span key={d} className="text-xs font-bold text-slate-400 dark:text-slate-500 py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((cell, idx) => {
                let cellClasses = 'w-9 h-9 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all select-none '

                if (!cell.isCurrentMonth || cell.isDisabled) {
                  cellClasses += 'text-slate-300 dark:text-slate-600 opacity-40 cursor-not-allowed'
                } else if (cell.isSelected) {
                  cellClasses += 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/30 scale-105'
                } else if (cell.isToday) {
                  cellClasses += 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border-2 border-blue-500 font-extrabold cursor-pointer hover:bg-blue-200'
                } else {
                  cellClasses += 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/60 hover:text-blue-600 cursor-pointer'
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={cell.isDisabled || !cell.isCurrentMonth}
                    onClick={() => handleDateClick(cell)}
                    className={cellClasses}
                  >
                    {cell.day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bottom Close Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DatePickerModal
