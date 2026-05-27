import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LayoutGrid, List } from 'lucide-react'
import ItemCard from '../components/ItemCard'
import StatusBadge from '../components/StatusBadge'
import { items } from '../data/mockData'

const CATEGORIES = [
  'Stationery', 'Electronics', 'Lab Equipment', 'Tools',
  'Safety Equipment', 'Computer Accessories', 'Mechanical Parts',
]
const STATUSES    = ['Available', 'Low Stock', 'Out of Stock']
const DEPARTMENTS = ['General', 'CS', 'EE', 'ME', 'Chemistry']

export default function Inventory() {
  const navigate = useNavigate()

  const [query,      setQuery]      = useState('')
  const [category,   setCategory]   = useState('')
  const [status,     setStatus]     = useState('')
  const [department, setDepartment] = useState('')
  const [sortBy,     setSortBy]     = useState('popularity')
  const [viewMode,   setViewMode]   = useState('grid')

  const filtered = useMemo(() => {
    let result = [...items]

    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    if (category)   result = result.filter(i => i.category === category)
    if (status)     result = result.filter(i => i.status === status)
    if (department) result = result.filter(i => i.department === department)

    result.sort((a, b) => {
      switch (sortBy) {
        case 'popularity': return b.popularityScore - a.popularityScore
        case 'name':       return a.name.localeCompare(b.name)
        case 'quantity':   return b.quantity.available - a.quantity.available
        case 'lastUsed':   return new Date(b.lastUsed) - new Date(a.lastUsed)
        default:           return 0
      }
    })

    return result
  }, [query, category, status, department, sortBy])

  const EmptyState = () => (
    <div className="card text-center py-16 text-gray-400">
      <p className="text-4xl mb-3">🔍</p>
      <p className="font-medium text-gray-600">No items found</p>
      <p className="text-sm mt-1">Try adjusting your filters or search term</p>
      <button
        onClick={() => { setQuery(''); setCategory(''); setStatus(''); setDepartment('') }}
        className="btn-secondary mt-4 text-sm"
      >
        Clear filters
      </button>
    </div>
  )

  return (
    <div className="space-y-5">

      {/* Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <span className="bg-lab-mauve/15 text-lab-mauve text-sm font-medium px-2.5 py-0.5 rounded-full">
          {items.length} items
        </span>
      </div>

      {/* Filter toolbar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search items, tags..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Department */}
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-field w-auto"
          >
            <option value="popularity">Popularity</option>
            <option value="name">Name (A-Z)</option>
            <option value="quantity">Quantity</option>
            <option value="lastUsed">Last Used</option>
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-lab-slate/40 overflow-hidden flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-lab-mauve text-white'
                  : 'bg-white text-gray-500 hover:bg-lab-cream'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-lab-mauve text-white'
                  : 'bg-white text-gray-500 hover:bg-lab-cream'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        <span className="font-medium text-gray-700">{filtered.length}</span> items found
      </p>

      {/* ── Grid view ── */}
      {viewMode === 'grid' && (
        filtered.length === 0
          ? <EmptyState />
          : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => navigate('/inventory/' + item.id)}
                />
              ))}
            </div>
          )
      )}

      {/* ── List view ── */}
      {viewMode === 'list' && (
        filtered.length === 0
          ? <EmptyState />
          : (
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-lab-cream/60 border-b border-lab-slate/20">
                  <tr>
                    {['Item', 'Category', 'Available', 'Location', 'Status', 'Popularity', 'Actions'].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-slate/10">
                  {filtered.map(item => (
                    <tr
                      key={item.id}
                      className="hover:bg-lab-cream/30 transition-colors"
                    >
                      {/* Item */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl flex-shrink-0">{item.image}</span>
                          <div>
                            <p className="font-medium text-gray-800 leading-tight">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="bg-lab-slate/20 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </td>

                      {/* Available */}
                      <td className="px-4 py-3 text-gray-700 font-semibold">
                        {item.quantity.available}
                        <span className="text-xs text-gray-400 font-normal"> / {item.quantity.total}</span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-gray-500 text-xs leading-relaxed">
                        {item.location.room}
                        <br />
                        {item.location.cabinet}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Popularity */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-lab-slate/20 rounded-full overflow-hidden flex-shrink-0">
                            <div
                              className="h-full bg-lab-mauve rounded-full"
                              style={{ width: `${item.popularityScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{item.popularityScore}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => navigate('/inventory/' + item.id)}
                            className="text-xs text-lab-mauve hover:underline font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate('/borrow-return')}
                            className="text-xs text-lab-sage hover:underline font-medium"
                          >
                            Borrow
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  )
}
