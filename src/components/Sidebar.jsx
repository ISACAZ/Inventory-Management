import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  QrCode,
  ArrowLeftRight,
  MapPin,
  Lightbulb,
  Trophy,
  BarChart2,
  FileText,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',       icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Inventory',       icon: Package,         to: '/inventory' },
  { label: 'QR Scan',         icon: QrCode,          to: '/qr-scanner' },
  { label: 'Borrow / Return', icon: ArrowLeftRight,  to: '/borrow-return' },
  { label: 'Locations',       icon: MapPin,          to: '/locations' },
  { label: 'Recommendations', icon: Lightbulb,       to: '/recommendations' },
  { label: 'Leaderboard',     icon: Trophy,          to: '/leaderboard' },
  { label: 'Statistics',      icon: BarChart2,       to: '/statistics' },
  { label: 'Reports',         icon: FileText,        to: '/reports' },
  { label: 'Admin Panel',     icon: Shield,          to: '/admin' },
  { label: 'Settings',        icon: Settings,        to: '/settings' },
]

export default function Sidebar({ open, onToggle }) {
  const location = useLocation()

  return (
    <aside
      className="relative flex flex-col bg-white border-r border-lab-slate/20 h-full flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
      style={{ width: open ? '240px' : '64px' }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-lab-slate/20 flex-shrink-0">
        <span className="text-xl flex-shrink-0">🔬</span>
        {open && (
          <span className="ml-2 font-semibold text-gray-800 whitespace-nowrap overflow-hidden">
            Smart Lab
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ label, icon: Icon, to }) => {
          const isActive =
            to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(to)

          return (
            <NavLink
              key={to}
              to={to}
              className={[
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-lab-mauve/10 text-lab-mauve font-medium border-l-2 border-lab-mauve'
                  : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent',
              ].join(' ')}
              title={!open ? label : undefined}
            >
              <Icon
                className={`flex-shrink-0 ${isActive ? 'text-lab-mauve' : 'text-gray-400'}`}
                size={18}
              />
              {open && <span className="truncate">{label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-lab-slate/20 p-4 flex items-center gap-3 flex-shrink-0">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lab-mauve flex items-center justify-center text-white text-xs font-semibold">
          AJ
        </div>
        {open && (
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">Alex Johnson</p>
            <p className="text-xs text-gray-400 truncate">Computer Science</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute top-5 -right-3 z-10 w-6 h-6 rounded-full bg-white border border-lab-slate/30 shadow flex items-center justify-center text-gray-500 hover:text-lab-mauve transition-colors"
        title={open ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </aside>
  )
}
