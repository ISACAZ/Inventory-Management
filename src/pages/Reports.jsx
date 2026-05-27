import { useState } from 'react'
import {
  Package,
  ArrowLeftRight,
  AlertCircle,
  AlertTriangle,
  SearchX,
  TrendingUp,
  MapPin,
  Download,
} from 'lucide-react'
import { items, transactions, stats } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'

const REPORT_TYPES = [
  { id: 'lowstock',  label: 'Low Stock Report',     icon: Package,       emoji: '📦' },
  { id: 'borrowed',  label: 'Borrowed Items',        icon: ArrowLeftRight, emoji: '📋' },
  { id: 'overdue',   label: 'Overdue Items',         icon: AlertCircle,   emoji: '⏰' },
  { id: 'damaged',   label: 'Damaged Items',         icon: AlertTriangle, emoji: '⚠️' },
  { id: 'missing',   label: 'Missing Items',         icon: SearchX,       emoji: '🔍' },
  { id: 'popular',   label: 'Popular Items',         icon: TrendingUp,    emoji: '⭐' },
  { id: 'location',  label: 'Location Confusion',    icon: MapPin,        emoji: '📍', special: true },
]

const REPORT_META = {
  lowstock: {
    title: '📦 Low Stock Report',
    description: 'Items with Available status of "Low Stock" or "Out of Stock". Review these to initiate restocking requests before shortages impact lab operations.',
  },
  borrowed: {
    title: '📋 Borrowed Items',
    description: 'All currently borrowed items and their expected return dates. Use this to track active loans and follow up on overdue returns.',
  },
  overdue: {
    title: '⏰ Overdue Items',
    description: 'Items whose expected return date has passed and have not yet been returned. Contact borrowers to arrange return.',
  },
  damaged: {
    title: '⚠️ Damaged Items',
    description: 'Items returned in damaged condition. Review and flag for repair, disposal, or replacement.',
  },
  missing: {
    title: '🔍 Missing Items',
    description: 'Items reported as missing or lost by users. Investigate their last known location and borrower.',
  },
  popular: {
    title: '⭐ Popular Items',
    description: 'Top items ranked by usage count. Use to inform restocking priorities and procurement decisions.',
  },
  location: {
    title: '📍 Location Confusion Report',
    description: 'Items frequently found in incorrect storage locations. The "Confusion Score" measures how often an item is returned to the wrong place, helping identify labelling or training issues.',
  },
}

const TODAY = '2026-05-27'

function daysOverdue(expectedReturn) {
  const due = new Date(expectedReturn)
  const today = new Date(TODAY)
  return Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)))
}

// Mock confusion score data for location report
const locationConfusionData = [
  { itemName: 'Jumper Wires Set (65pcs)', itemId: 'item-013', confusionScore: 87, lastMisplace: '2026-05-20', incidents: 5 },
  { itemName: 'USB-C Hub (7-in-1)',       itemId: 'item-006', confusionScore: 72, lastMisplace: '2026-05-18', incidents: 4 },
  { itemName: 'Whiteboard Marker (Blue)', itemId: 'item-001', confusionScore: 65, lastMisplace: '2026-05-15', incidents: 3 },
  { itemName: 'A4 Paper (Ream 500)',      itemId: 'item-004', confusionScore: 54, lastMisplace: '2026-05-10', incidents: 3 },
  { itemName: 'Arduino Uno R3',           itemId: 'item-007', confusionScore: 41, lastMisplace: '2026-05-05', incidents: 2 },
]

function getReportData(reportId) {
  switch (reportId) {
    case 'lowstock':
      return items.filter(it => it.status === 'Low Stock' || it.status === 'Out of Stock')
    case 'borrowed':
      return transactions.filter(tx => tx.action === 'Borrowed')
    case 'overdue':
      return transactions.filter(tx =>
        tx.action === 'Borrowed' &&
        tx.expectedReturn &&
        tx.actualReturn === null &&
        new Date(tx.expectedReturn) < new Date(TODAY)
      )
    case 'damaged':
      return transactions.filter(tx => tx.condition === 'Damaged')
    case 'missing':
      return transactions.filter(tx => tx.action === 'Reported')
    case 'popular':
      return stats.itemUsage.map(u => {
        const item = items.find(it => it.name === u.name)
        return { ...u, popularityScore: item?.popularityScore ?? 0, category: u.category }
      })
    case 'location':
      return locationConfusionData
    default:
      return []
  }
}

function ReportTable({ reportId, data }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No results for this report.</p>
  }

  switch (reportId) {
    case 'lowstock':
      return (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-lab-slate/20 text-left">
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Available</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Total</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-2.5 pr-4">
                  <span className="mr-2">{item.image}</span>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </td>
                <td className="py-2.5 pr-4 text-gray-500">{item.category}</td>
                <td className="py-2.5 pr-4 text-right font-bold text-red-500">{item.quantity?.available}</td>
                <td className="py-2.5 pr-4 text-right text-gray-500">{item.quantity?.total}</td>
                <td className="py-2.5"><StatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'borrowed':
      return (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-lab-slate/20 text-left">
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Borrower</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expected Return</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="py-2.5 pr-4 font-medium text-gray-800">{tx.itemName}</td>
                <td className="py-2.5 pr-4 text-gray-600">{tx.userName}</td>
                <td className="py-2.5 pr-4 text-gray-500">{tx.date}</td>
                <td className="py-2.5 pr-4 text-gray-500">{tx.expectedReturn ?? '—'}</td>
                <td className="py-2.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Borrowed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'overdue':
      return (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-lab-slate/20 text-left">
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Borrower</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Days Overdue</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="py-2.5 pr-4 font-medium text-gray-800">{tx.itemName}</td>
                <td className="py-2.5 pr-4 text-gray-600">{tx.userName}</td>
                <td className="py-2.5 pr-4 text-red-500 font-medium">{tx.expectedReturn}</td>
                <td className="py-2.5 text-right">
                  <span className="font-bold text-red-600">{daysOverdue(tx.expectedReturn)}d</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'damaged':
      return (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-lab-slate/20 text-left">
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Condition</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="py-2.5 pr-4 font-medium text-gray-800">{tx.itemName}</td>
                <td className="py-2.5 pr-4 text-gray-600">{tx.userName}</td>
                <td className="py-2.5 pr-4 text-gray-500">{tx.date}</td>
                <td className="py-2.5"><StatusBadge status={tx.condition ?? 'Damaged'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'missing':
      return (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-lab-slate/20 text-left">
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reporter</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Purpose</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="py-2.5 pr-4 font-medium text-gray-800">{tx.itemName}</td>
                <td className="py-2.5 pr-4 text-gray-600">{tx.userName}</td>
                <td className="py-2.5 pr-4 text-gray-500">{tx.date}</td>
                <td className="py-2.5 text-gray-500">{tx.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'popular':
      return (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-lab-slate/20 text-left">
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Usage Count</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Popularity Score</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="py-2.5 pr-4 font-medium text-gray-800">{row.name}</td>
                <td className="py-2.5 pr-4 text-gray-500">{row.category}</td>
                <td className="py-2.5 pr-4 text-right font-bold text-lab-mauve">{row.usageCount}</td>
                <td className="py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-lab-mauve" style={{ width: `${row.popularityScore}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right">{row.popularityScore}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'location':
      return (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-lab-slate/20 text-left">
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Confusion Score</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Incidents</th>
            <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Misplace</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(row => (
              <tr key={row.itemId} className="hover:bg-gray-50">
                <td className="py-2.5 pr-4 font-medium text-gray-800">{row.itemName}</td>
                <td className="py-2.5 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.confusionScore >= 70 ? 'bg-red-400' : row.confusionScore >= 50 ? 'bg-lab-amber' : 'bg-lab-sage'}`}
                        style={{ width: `${row.confusionScore}%` }}
                      />
                    </div>
                    <span className={`font-bold text-xs w-6 ${row.confusionScore >= 70 ? 'text-red-600' : row.confusionScore >= 50 ? 'text-lab-amber' : 'text-lab-sage'}`}>
                      {row.confusionScore}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-right text-gray-600">{row.incidents}</td>
                <td className="py-2.5 text-gray-500">{row.lastMisplace}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )

    default:
      return null
  }
}

export default function Reports() {
  const [activeReport, setActiveReport] = useState('lowstock')
  const [fromDate, setFromDate] = useState('2026-05-01')
  const [toDate, setToDate] = useState(TODAY)

  const meta = REPORT_META[activeReport]
  const data = getReportData(activeReport)

  return (
    <div className="flex gap-6">
      {/* ── Sidebar ── */}
      <div className="w-56 flex-shrink-0">
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-lab-slate/20">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Report Types</p>
          </div>
          <nav className="p-2 space-y-0.5">
            {REPORT_TYPES.map(rt => {
              const active = activeReport === rt.id
              return (
                <button
                  key={rt.id}
                  onClick={() => setActiveReport(rt.id)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                    ${active
                      ? 'bg-lab-mauve/10 text-lab-mauve font-medium border-l-2 border-lab-mauve'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                    ${rt.special ? 'mt-2 border-t border-lab-slate/20 pt-3' : ''}
                  `}
                >
                  <rt.icon size={15} className={active ? 'text-lab-mauve' : 'text-gray-400'} />
                  <span>{rt.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Header */}
        <div className="card">
          <h2 className="section-title">{meta.title}</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{meta.description}</p>
        </div>

        {/* Date Range Filter */}
        <div className="card">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="label block mb-1">From</label>
              <input
                type="date"
                className="input-field w-auto"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label block mb-1">To</label>
              <input
                type="date"
                className="input-field w-auto"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>
            <button className="btn-primary flex items-center gap-2">
              Generate Report
            </button>
            <button
              onClick={() => alert('Exporting CSV…')}
              className="btn-secondary flex items-center gap-2 ml-auto"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Results</h3>
            <span className="text-sm text-gray-400">Showing {data.length} result{data.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <ReportTable reportId={activeReport} data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
