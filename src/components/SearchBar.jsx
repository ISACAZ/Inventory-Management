import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, MapPin } from 'lucide-react'
import { items } from '../data/mockData'
import StatusBadge from './StatusBadge'

export default function SearchBar({ placeholder = 'Search items...' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  // Filter items when query changes
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      setResults([])
      setIsOpen(false)
      return
    }

    const filtered = items
      .filter((item) => {
        const inName     = item.name?.toLowerCase().includes(q)
        const inCategory = item.category?.toLowerCase().includes(q)
        const inTags     = item.tags?.some((t) => t.toLowerCase().includes(q))
        return inName || inCategory || inTags
      })
      .slice(0, 5)

    setResults(filtered)
    setIsOpen(true)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  function handleClear() {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  function handleView(id) {
    setIsOpen(false)
    setQuery('')
    navigate(`/inventory/${id}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder={placeholder}
          className="input-field pl-9 pr-8 rounded-xl"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-white rounded-xl shadow-lg border border-lab-slate/20 overflow-hidden">
          {results.length > 0 ? (
            <ul>
              {results.map((item) => {
                const locationShort = [item.location?.building, item.location?.room]
                  .filter(Boolean)
                  .join(' → ')

                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                  >
                    {/* Emoji */}
                    <span className="text-lg flex-shrink-0 w-8 text-center">
                      {item.image || '📦'}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-gray-800 truncate">
                          {item.name}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-lab-sage">
                          Available: {item.quantity?.available ?? 0}
                        </span>
                        {locationShort && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={10} />
                            {locationShort}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleView(item.id)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-lab-slate/30 hover:bg-lab-slate/50 text-gray-700 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-lab-mauve text-white hover:bg-lab-mauve/90 transition-colors"
                      >
                        Borrow
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
