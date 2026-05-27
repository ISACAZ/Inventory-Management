import { useParams, useNavigate } from 'react-router-dom'
import { QrCode, ArrowLeft, TrendingUp } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import ItemCard from '../components/ItemCard'
import LocationBreadcrumb from '../components/LocationBreadcrumb'
import { items, transactions } from '../data/mockData'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const item = items.find(i => i.id === id)

  if (!item) {
    return (
      <div className="card text-center py-20">
        <p className="text-5xl mb-4">📦</p>
        <h2 className="text-xl font-semibold text-gray-700">Item not found</h2>
        <p className="text-gray-400 mt-1 mb-6">
          No item exists with ID <code className="bg-lab-cream px-1.5 py-0.5 rounded text-sm">{id}</code>
        </p>
        <button onClick={() => navigate('/inventory')} className="btn-primary">
          ← Back to Inventory
        </button>
      </div>
    )
  }

  const itemTransactions = transactions
    .filter(t => t.itemId === item.id)
    .slice(0, 5)

  const similarItemObjects = item.similarItems
    .map(sid => items.find(i => i.id === sid))
    .filter(Boolean)
    .slice(0, 3)

  return (
    <div className="space-y-2">

      {/* Back breadcrumb */}
      <button
        onClick={() => navigate('/inventory')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-lab-mauve transition-colors mb-2"
      >
        <ArrowLeft size={14} />
        Back to Inventory
      </button>

      <div className="flex gap-6 items-start">

        {/* ── Left column ── */}
        <div className="w-64 flex-shrink-0 space-y-4">

          {/* Image + status */}
          <div className="card text-center">
            <div className="w-20 h-20 rounded-2xl bg-lab-mauve/10 flex items-center justify-center text-5xl mx-auto">
              {item.image}
            </div>
            <div className="mt-3 flex justify-center">
              <StatusBadge status={item.status} />
            </div>
            <p className="text-xs text-gray-400 mt-2">Last used: {item.lastUsed}</p>
          </div>

          {/* QR Code */}
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">QR Code</p>
            <div className="border-2 border-dashed border-lab-slate/40 rounded-xl p-4 text-center bg-gray-50">
              <QrCode size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 font-mono break-all">{item.qrCode}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="card space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Actions</p>
            <button
              onClick={() => navigate('/borrow-return')}
              className="btn-primary w-full text-sm"
            >
              Borrow
            </button>
            <button
              onClick={() => navigate('/borrow-return')}
              className="btn-sage w-full text-sm"
            >
              Return
            </button>
            <button className="btn-secondary w-full text-sm">
              Reserve
            </button>

            <hr className="border-lab-slate/20 my-1" />

            <button className="w-full text-sm text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors text-left px-2">
              ⚠ Report Missing
            </button>
            <button className="btn-secondary w-full text-sm">
              📦 Request Restock
            </button>
            <button className="btn-secondary w-full text-sm">
              🖨 Print QR Label
            </button>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Header card */}
          <div className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">{item.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-lab-mauve/10 text-lab-mauve text-xs px-2.5 py-0.5 rounded-full font-medium">
                    {item.category}
                  </span>
                  <span className="bg-lab-slate/20 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">
                    {item.department}
                  </span>
                  {item.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-lab-cream text-gray-500 text-xs px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-4xl flex-shrink-0">{item.image}</span>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">{item.description}</p>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              {[
                { label: 'Available', value: item.quantity.available, color: 'text-lab-sage' },
                { label: 'Total',     value: item.quantity.total,     color: 'text-gray-700' },
                { label: 'Borrowed',  value: item.quantity.borrowed,  color: 'text-lab-amber' },
                { label: 'Condition', value: item.condition,          color: 'text-gray-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center bg-lab-cream/50 rounded-xl p-3">
                  <p className={`text-xl font-bold leading-tight ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Popularity bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-lab-mauve" />
                  Popularity
                </p>
                <p className="text-sm text-gray-500">Score: {item.popularityScore}/100</p>
              </div>
              <div className="h-2 bg-lab-slate/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-lab-mauve rounded-full transition-all duration-500"
                  style={{ width: `${item.popularityScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <p className="section-title mb-4">📍 Location</p>
            <LocationBreadcrumb location={item.location} />
            <p className="text-xs text-gray-400 mt-3">
              Location ID: <span className="font-mono">{item.location.locationId}</span>
            </p>
          </div>

          {/* Usage History */}
          <div className="card">
            <h2 className="section-title mb-4">Usage History</h2>
            {itemTransactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No transaction history found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-lab-slate/20">
                      {['Date', 'User', 'Action', 'Qty', 'Location'].map(h => (
                        <th
                          key={h}
                          className="text-left pb-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lab-slate/10">
                    {itemTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-lab-cream/30 transition-colors">
                        <td className="py-2.5 text-gray-600">{tx.date}</td>
                        <td className="py-2.5 font-medium text-gray-700">{tx.userName}</td>
                        <td className="py-2.5">
                          <StatusBadge status={tx.action} />
                        </td>
                        <td className="py-2.5 text-gray-600">{tx.quantity}</td>
                        <td className="py-2.5 text-gray-400 text-xs font-mono">{tx.locationId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Similar Items */}
          {similarItemObjects.length > 0 && (
            <div>
              <h2 className="section-title mb-4">Similar Items</h2>
              <div className="grid grid-cols-3 gap-4">
                {similarItemObjects.map(simItem => (
                  <ItemCard
                    key={simItem.id}
                    item={simItem}
                    onClick={() => navigate('/inventory/' + simItem.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
