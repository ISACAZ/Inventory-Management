import { useState } from 'react'
import { Menu, Search, Bell } from 'lucide-react'

export default function Topbar({ onMenuToggle }) {
  const [query, setQuery] = useState('')

  return (
    <header className="bg-white border-b border-lab-slate/20 h-16 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Menu toggle */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors flex-shrink-0"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items, locations..."
          className="input-field pl-9"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            3
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-lab-slate/30" />

        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-lab-mauve flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            AJ
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800 leading-tight">Alex Johnson</p>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-lab-slate/30 text-gray-600 leading-none">
              Student
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
