import { Train, Navigation, Bell, Bot } from 'lucide-react'

const features = [
  {
    icon: Train,
    title: 'Smart Journey Tracking',
    description: 'Track your selected journey in real time.',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
  },
  {
    icon: Navigation,
    title: 'Live Train Status',
    description: 'Check the latest running status of any train.',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    icon: Bell,
    title: 'Destination Alerts',
    description: 'Receive timely alerts before reaching your destination.',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
  },
  {
    icon: Bot,
    title: 'AI Travel Assistant',
    description: 'AI-powered travel insights and smarter arrival predictions.',
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
  },
]

function FeaturesSection() {
  return (
    <section aria-label="Why RailAlert AI Section" className="w-full space-y-6 pt-2">
      {/* Introduction Header */}
      <div className="text-left space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Why RailAlert AI?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-3xl leading-relaxed">
          RailAlert AI is your smart railway travel companion that helps you search trains, monitor live train movements, receive intelligent arrival alerts, and never miss your destination.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#111936] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group cursor-default"
            >
              <div className="space-y-3">
                <div className={`p-3 rounded-2xl w-fit ${item.iconBg} ${item.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default FeaturesSection
