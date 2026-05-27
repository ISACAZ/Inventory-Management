import { useState } from 'react'
import {
  Search,
  Plus,
  Download,
  Pencil,
  Trash2,
  QrCode,
  Eye,
  Trophy,
  Check,
  X,
} from 'lucide-react'
import { items, users, pendingRequests } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import BadgePill from '../components/BadgePill'

const TABS = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'users',     label: 'Users' },
  { id: 'requests',  label: 'Requests' },
]

const REQUEST_FILTER_TABS = ['All', 'Pending', 'Approved', 'Rejected']

const requestTypeBadge = {
  Borrow:   'bg-blue-100 text-blue-700',
  Restock:  'bg-lab-sage/15 text-lab-sage',
  Missing:  'bg-red-100 text-red-600',
  Location: 'bg-lab-amber/15 text-lab-amber',
}

const roleBadge = {
  Student:       'bg-blue-100 text-blue-700',
  'Lab Assistant': 'bg-lab-sage/15 text-lab-sage',
  Admin:         'bg-lab-mauve/15 text-lab-mauve',
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [inventorySearch, setInventorySearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [requestFilter, setRequestFilter] = useState('All')
  const [requestStatuses, setRequestStatuses] = useState(
    () => Object.fromEntries(pendingRequests.map(r => [r.id, r.status]))
  )

  // Filter helpers
  const filteredItems = items.filter(it =>
    !inventorySearch.trim() ||
    it.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    it.category.toLowerCase().includes(inventorySearch.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    !userSearch.trim() ||
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.department.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredRequests = pendingRequests.filter(r => {
    if (requestFilter === 'All') return true
    return requestStatuses[r.id] === requestFilter
  })

  const approveRequest = (id) =>
    setRequestStatuses(prev => ({ ...prev, [id]: 'Approved' }))
  const rejectRequest = (id) =>
    setRequestStatuses(prev => ({ ...prev, [id]: 'Rejected' }))

  return (
    <div className="space-y-4">
      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-white text-lab-mauve shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ INVENTORY TAB ══════════════════ */}
      {activeTab === 'inventory' && (
        <div className="card">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-8"
                placeholder="Search items…"
                value={inventorySearch}
                onChange={e => setInventorySearch(e.target.value)}
              />
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={15} /> Add Item
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Download size={15} /> Export
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-lab-slate/20 text-left">
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item Name</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Avail / Total</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Location</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-50 hover:bg-lab-mauve/3 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg flex-shrink-0">{item.image}</span>
                        <span className="font-medium text-gray-800 truncate max-w-[180px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-500 hidden sm:table-cell">{item.category}</td>
                    <td className="py-2.5 pr-4 text-right text-sm">
                      <span className="font-medium text-lab-sage">{item.quantity?.available}</span>
                      <span className="text-gray-400"> / {item.quantity?.total}</span>
                    </td>
                    <td className="py-2.5 pr-4 hidden md:table-cell">
                      <span className="text-xs text-gray-500">
                        {item.location?.building} · {item.location?.room}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-md hover:bg-lab-mauve/10 transition-colors" title="Edit">
                          <Pencil size={14} className="text-lab-mauve" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Archive">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="QR Code">
                          <QrCode size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">{filteredItems.length} items</p>
        </div>
      )}

      {/* ══════════════════ USERS TAB ══════════════════ */}
      {activeTab === 'users' && (
        <div className="card">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-8"
                placeholder="Search users…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={15} /> Add User
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-lab-slate/20 text-left">
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Department</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Role</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Points</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Badges</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                  >
                    {/* Avatar + Name */}
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: user.avatarColor ?? '#B294A0' }}
                        >
                          {user.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-2.5 pr-4 text-gray-500 text-xs hidden md:table-cell">{user.department}</td>

                    {/* Role */}
                    <td className="py-2.5 pr-4 hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-2.5 pr-4 text-right">
                      <span className="flex items-center justify-end gap-1 font-semibold text-gray-700">
                        <Trophy size={12} className="text-lab-amber" />
                        {user.points.toLocaleString()}
                      </span>
                    </td>

                    {/* Badges */}
                    <td className="py-2.5 pr-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 flex-wrap">
                        {user.badges.slice(0, 2).map(b => (
                          <BadgePill key={b.id} badge={b} />
                        ))}
                        {user.badges.length > 2 && (
                          <span className="text-xs text-gray-400">+{user.badges.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-md hover:bg-lab-mauve/10 transition-colors" title="Edit">
                          <Pencil size={14} className="text-lab-mauve" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="View Activity">
                          <Eye size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">{filteredUsers.length} users</p>
        </div>
      )}

      {/* ══════════════════ REQUESTS TAB ══════════════════ */}
      {activeTab === 'requests' && (
        <div className="card">
          {/* Filter sub-tabs */}
          <div className="flex items-center gap-1 mb-5 border-b border-lab-slate/20 pb-4">
            {REQUEST_FILTER_TABS.map(f => (
              <button
                key={f}
                onClick={() => setRequestFilter(f)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  requestFilter === f
                    ? 'bg-lab-mauve/10 text-lab-mauve'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">{filteredRequests.length} requests</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-lab-slate/20 text-left">
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Requester</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right hidden sm:table-cell">Qty</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Purpose</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, i) => {
                  const currentStatus = requestStatuses[req.id]
                  const isPending = currentStatus === 'Pending'
                  return (
                    <tr
                      key={req.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                    >
                      {/* Type */}
                      <td className="py-2.5 pr-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${requestTypeBadge[req.type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {req.type}
                        </span>
                      </td>

                      {/* Requester */}
                      <td className="py-2.5 pr-4 font-medium text-gray-700">{req.userName}</td>

                      {/* Item */}
                      <td className="py-2.5 pr-4 text-gray-600 max-w-[160px]">
                        <span className="truncate block">{req.itemName}</span>
                      </td>

                      {/* Qty */}
                      <td className="py-2.5 pr-4 text-right text-gray-600 hidden sm:table-cell">{req.quantity}</td>

                      {/* Date */}
                      <td className="py-2.5 pr-4 text-gray-500 hidden md:table-cell">{req.date}</td>

                      {/* Purpose */}
                      <td className="py-2.5 pr-4 text-gray-500 text-xs hidden lg:table-cell max-w-[140px]">
                        <span className="truncate block">{req.purpose}</span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={currentStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => approveRequest(req.id)}
                              className="p-1.5 rounded-md bg-lab-sage/10 hover:bg-lab-sage/20 transition-colors"
                              title="Approve"
                            >
                              <Check size={14} className="text-lab-sage" />
                            </button>
                            <button
                              onClick={() => rejectRequest(req.id)}
                              className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 transition-colors"
                              title="Reject"
                            >
                              <X size={14} className="text-red-500" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">{currentStatus}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredRequests.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No requests match the selected filter.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
