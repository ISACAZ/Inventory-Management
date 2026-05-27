import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, CheckCircle, ArrowLeftRight, AlertTriangle,
  Clock, CalendarClock, QrCode, ArrowDownToLine,
  RotateCcw, AlertOctagon, RefreshCw, PlusCircle,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import ActivityFeed from '../components/ActivityFeed'
import RecommendationCard from '../components/RecommendationCard'
import { items, transactions, stats, recommendations } from '../data/mockData'

export default function Dashboard() {
  const navigate = useNavigate()
  const [actionMsg, setActionMsg] = useState('')

  const lowStockItems = items.filter(
    i => i.status === 'Low Stock' || i.status === 'Out of Stock'
  )

  const quickActions = [
    { icon: QrCode,          label: 'Scan QR',        style: 'btn-primary',   onClick: () => navigate('/qr-scanner') },
    { icon: ArrowDownToLine, label: 'Borrow',          style: 'btn-sage',      onClick: () => navigate('/borrow-return') },
    { icon: RotateCcw,       label: 'Return',          style: 'btn-sage',      onClick: () => navigate('/borrow-return') },
    { icon: AlertOctagon,    label: 'Report Missing',  style: 'btn-amber',     onClick: () => setActionMsg('Report Missing form — opens in full-page view') },
    { icon: RefreshCw,       label: 'Request Restock', style: 'btn-amber',     onClick: () => setActionMsg('✅ Restock request sent to administrator!') },
    { icon: PlusCircle,      label: 'Add New Item',    style: 'btn-secondary', onClick: () => navigate('/admin') },
  ]

  return (
    <div className="space-y-6">

      {/* ── Section 1: Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Items"
          value={310}
          icon={Package}
          color="mauve"
        />
        <StatCard
          title="Available"
          value={249}
          icon={CheckCircle}
          color="sage"
          trend="up"
          trendValue="+12 this week"
        />
        <StatCard
          title="Borrowed"
          value={42}
          icon={ArrowLeftRight}
          color="amber"
        />
        <StatCard
          title="Low Stock"
          value={9}
          icon={AlertTriangle}
          color="amber"
          subtitle="Need restock"
        />
        <StatCard
          title="Pending Requests"
          value={7}
          icon={Clock}
          color="slate"
        />
        <StatCard
          title="Due Today"
          value={3}
          icon={CalendarClock}
          color="mauve"
        />
      </div>

      {/* ── Section 2: Quick Actions ── */}
      <div className="card">
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {quickActions.map(({ icon: Icon, label, style, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`${style} flex items-center gap-2 whitespace-nowrap flex-shrink-0 text-sm`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        {actionMsg && (
          <p className="mt-3 text-sm text-lab-sage bg-lab-sage/10 rounded-lg px-3 py-2">
            {actionMsg}
          </p>
        )}
      </div>

      {/* ── Section 3: Main Content ── */}
      <div className="flex gap-6">

        {/* Left column – charts */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Stock Movement */}
          <div className="card">
            <h2 className="section-title mb-4">Stock Movement</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={stats.stockMovement}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E5E7EB' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="borrowed"
                  fill="#B294A0"
                  stroke="#B294A0"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="returned"
                  fill="#7C8D7D"
                  stroke="#7C8D7D"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="restocked"
                  fill="#C2CCD6"
                  stroke="#C2CCD6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Most Used Items */}
          <div className="card">
            <h2 className="section-title mb-4">Most Used Items</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={stats.itemUsage.slice(0, 8)}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E5E7EB' }}
                />
                <Bar dataKey="usageCount" fill="#B294A0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column – sidebar */}
        <div className="w-80 flex-shrink-0 space-y-6">

          {/* Recent Activity */}
          <div className="card">
            <h2 className="section-title mb-4">Recent Activity</h2>
            <ActivityFeed transactions={transactions} limit={6} />
          </div>

          {/* Low Stock Alerts */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Low Stock Alerts</h2>
              <a
                href="/inventory"
                className="text-xs text-lab-mauve hover:underline"
              >
                View All
              </a>
            </div>
            <div className="space-y-3">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{item.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.quantity.available} available
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  All items well-stocked 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Smart Recommendations ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">💡 Recommended for You</h2>
          <a href="/recommendations" className="text-xs text-lab-mauve hover:underline">
            View All
          </a>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {recommendations.forYou.slice(0, 3).map(rec => (
            <RecommendationCard key={rec.itemId} recommendation={rec} type="forYou" />
          ))}
        </div>
      </div>

    </div>
  )
}
