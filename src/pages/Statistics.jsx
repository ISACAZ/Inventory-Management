import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Package,
  CheckCircle,
  ArrowLeftRight,
  AlertTriangle,
  SearchX,
  TrendingDown,
  Users,
  QrCode,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import { stats } from '../data/mockData'
import StatCard from '../components/StatCard'

const trendBadgeColors = {
  Critical: 'bg-red-100 text-red-700',
  Low:      'bg-lab-amber/20 text-lab-amber',
  Watch:    'bg-lab-slate/30 text-gray-600',
  Out:      'bg-gray-800 text-white',
}

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  if (percent < 0.05) return null
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function Statistics() {
  const { summary, stockMovement, itemUsage, lowStockForecast, locationUsage, userActivity, categoryBreakdown } = stats

  return (
    <div className="space-y-6">
      {/* ── Section 1: Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Items"  value={summary.total}     icon={Package}       color="mauve" />
        <StatCard title="Available"    value={summary.available} icon={CheckCircle}   color="sage"  trend="up"   trendValue="+4" />
        <StatCard title="Borrowed"     value={summary.borrowed}  icon={ArrowLeftRight} color="amber" />
        <StatCard title="Damaged"      value={summary.damaged}   icon={AlertTriangle} color="amber" trend="down" trendValue="-2" />
        <StatCard title="Missing"      value={summary.missing}   icon={SearchX}       color="slate" />
        <StatCard title="Low Stock"    value={summary.lowStock}  icon={TrendingDown}  color="amber" />
      </div>

      {/* ── Section 2: Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Area Chart */}
        <div className="card">
          <h3 className="section-title mb-4">📈 Stock Movement (Last 12 Weeks)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stockMovement} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#B294A0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#B294A0" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C8D7D" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7C8D7D" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorRestocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C2CCD6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C2CCD6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="borrowed"  stroke="#B294A0" fill="url(#colorBorrowed)"  strokeWidth={2} name="Borrowed" />
              <Area type="monotone" dataKey="returned"  stroke="#7C8D7D" fill="url(#colorReturned)"  strokeWidth={2} name="Returned" />
              <Area type="monotone" dataKey="restocked" stroke="#C2CCD6" fill="url(#colorRestocked)" strokeWidth={2} name="Restocked" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="section-title mb-4">🥧 Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="45%"
                outerRadius={90}
                dataKey="value"
                labelLine={false}
                label={<CustomPieLabel />}
              >
                {categoryBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} items`, name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Section 3: Most Used Items ── */}
      <div className="card">
        <h3 className="section-title mb-4">🔝 Most Used Items (Top 10)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={itemUsage}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(v) => [v, 'Usage Count']}
            />
            <Bar dataKey="usageCount" fill="#B294A0" radius={[0, 4, 4, 0]} name="Usage" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Section 4: Low Stock Forecast ── */}
      <div className="card">
        <h3 className="section-title mb-4">⚠️ Low Stock Forecast</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-lab-slate/20 text-left">
                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item Name</th>
                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Current Stock</th>
                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Days Until Out</th>
                <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lowStockForecast.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 font-medium text-gray-800">{row.name}</td>
                  <td className="py-2.5 text-right">
                    <span className={`font-bold ${row.currentStock <= 2 ? 'text-red-600' : 'text-lab-amber'}`}>
                      {row.currentStock}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-gray-600">{row.daysUntilOut ?? '—'}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trendBadgeColors[row.trend] ?? 'bg-gray-100 text-gray-600'}`}>
                      {row.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 5: Location Usage + User Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Location Usage */}
        <div className="card">
          <h3 className="section-title mb-4">📍 Location Usage</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={locationUsage} margin={{ top: 0, right: 8, left: -20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="locationName"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="usageCount" fill="#7C8D7D" radius={[4, 4, 0, 0]} name="Usage" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity Metrics */}
        <div className="card">
          <h3 className="section-title mb-4">👥 User Activity</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active Users',       value: userActivity.activeUsers,     icon: Users,       bg: 'bg-lab-mauve/10', text: 'text-lab-mauve' },
              { label: 'QR Scans',           value: userActivity.qrScans,         icon: QrCode,      bg: 'bg-lab-sage/10',  text: 'text-lab-sage'  },
              { label: 'Return On-Time Rate', value: `${userActivity.returnOnTimeRate}%`, icon: Clock,  bg: 'bg-blue-50',     text: 'text-blue-600'  },
              { label: 'Damage Reports',     value: userActivity.damagedReports,  icon: ShieldAlert, bg: 'bg-red-50',       text: 'text-red-500'   },
            ].map(m => (
              <div key={m.label} className={`${m.bg} rounded-xl p-4 flex flex-col gap-2`}>
                <m.icon size={20} className={m.text} />
                <p className={`text-2xl font-bold ${m.text}`}>{m.value}</p>
                <p className="text-xs text-gray-500 leading-tight">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
