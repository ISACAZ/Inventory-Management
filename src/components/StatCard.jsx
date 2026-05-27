import { TrendingUp, TrendingDown } from 'lucide-react'

const colorMap = {
  mauve: {
    iconBg: 'bg-lab-mauve/15',
    iconText: 'text-lab-mauve',
  },
  sage: {
    iconBg: 'bg-lab-sage/15',
    iconText: 'text-lab-sage',
  },
  amber: {
    iconBg: 'bg-lab-amber/15',
    iconText: 'text-lab-amber',
  },
  slate: {
    iconBg: 'bg-lab-slate/30',
    iconText: 'text-gray-600',
  },
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'mauve',
  trend,
  trendValue,
  subtitle,
}) {
  const { iconBg, iconText } = colorMap[color] ?? colorMap.mauve
  const isUp = trend === 'up'
  const isDown = trend === 'down'

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {Icon && <Icon size={20} className={iconText} />}
        </div>

        {/* Trend badge */}
        {(isUp || isDown) && trendValue && (
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              isUp ? 'text-lab-sage' : 'text-red-500'
            }`}
          >
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
