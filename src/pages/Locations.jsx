import { useState, useMemo } from 'react'
import {
  Building2,
  Layers,
  DoorOpen,
  Archive,
  ChevronRight,
  ChevronDown,
  MapPin,
  QrCode,
  Printer,
  MoveRight,
  Tag,
  AlertCircle,
  Search,
} from 'lucide-react'
import { items, locations } from '../data/mockData'
import LocationBreadcrumb from '../components/LocationBreadcrumb'
import StatusBadge from '../components/StatusBadge'

// Build a nested tree: building → floor → room → cabinet → drawer (leaf = location)
function buildTree(locs) {
  const tree = {}
  for (const loc of locs) {
    const { building, floor, room, cabinet, drawer } = loc
    if (!tree[building]) tree[building] = {}
    if (!tree[building][floor]) tree[building][floor] = {}
    if (!tree[building][floor][room]) tree[building][floor][room] = {}
    const cabinetKey = cabinet
    if (!tree[building][floor][room][cabinetKey]) tree[building][floor][room][cabinetKey] = []
    tree[building][floor][room][cabinetKey].push(loc)
  }
  return tree
}

function itemCount(locs) {
  return locs.reduce((s, l) => s + (l.items?.length ?? 0), 0)
}

function ItemBadge({ count }) {
  return (
    <span className="ml-auto flex-shrink-0 text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
      {count}
    </span>
  )
}

export default function Locations() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set(['Building A', 'Building A|Floor 1']))
  const [search, setSearch] = useState('')

  const tree = useMemo(() => buildTree(locations), [])

  const toggle = (key) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const filteredLocations = useMemo(() => {
    if (!search.trim()) return locations
    const q = search.toLowerCase()
    return locations.filter(l =>
      l.building.toLowerCase().includes(q) ||
      l.floor.toLowerCase().includes(q) ||
      l.room.toLowerCase().includes(q) ||
      l.cabinet.toLowerCase().includes(q) ||
      l.drawer.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q)
    )
  }, [search])

  const displayTree = useMemo(() => buildTree(filteredLocations), [filteredLocations])

  // Look up item details for selected location
  const locationItems = useMemo(() => {
    if (!selectedLocation) return []
    return (selectedLocation.items ?? []).map(entry => {
      const found = items.find(it => it.id === entry.itemId)
      return found ? { ...found, storedQty: entry.quantity } : null
    }).filter(Boolean)
  }, [selectedLocation])

  const NodeRow = ({ icon: Icon, label, nodeKey, indent = 0, count, isLeaf, loc }) => {
    const expanded = expandedNodes.has(nodeKey)
    const isSelected = isLeaf && selectedLocation?.id === loc?.id

    return (
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer select-none text-sm transition-colors
          ${isSelected ? 'bg-lab-mauve/10 text-lab-mauve font-medium' : 'text-gray-700 hover:bg-gray-100'}
        `}
        style={{ paddingLeft: `${0.5 + indent * 1}rem` }}
        onClick={() => {
          if (isLeaf && loc) {
            setSelectedLocation(loc)
          } else {
            toggle(nodeKey)
          }
        }}
      >
        {!isLeaf && (
          <span className="text-gray-400 flex-shrink-0">
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        )}
        {isLeaf && <span className="w-4 flex-shrink-0" />}
        <Icon size={14} className={`flex-shrink-0 ${isSelected ? 'text-lab-mauve' : 'text-gray-400'}`} />
        <span className="truncate flex-1">{label}</span>
        {count != null && <ItemBadge count={count} />}
        {isLeaf && loc && (
          <button
            onClick={e => { e.stopPropagation(); alert(`Print QR for ${loc.qrCode}`) }}
            className="ml-1 text-gray-400 hover:text-lab-mauve flex-shrink-0"
            title="Print QR"
          >
            <Printer size={12} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-full">
      {/* ── Left Panel ── */}
      <div className="w-72 flex-shrink-0 flex flex-col">
        <div className="card flex flex-col gap-3 h-full overflow-hidden">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-lab-mauve" />
            <h2 className="section-title">Locations</h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-8 text-xs"
              placeholder="Search locations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto -mx-2 space-y-0.5 pr-1">
            {Object.entries(displayTree).map(([building, floors]) => {
              const buildingKey = building
              const buildingCount = Object.values(floors).flatMap(rooms =>
                Object.values(rooms).flatMap(cabinets =>
                  Object.values(cabinets).flat()
                )
              )
              return (
                <div key={building}>
                  <NodeRow
                    icon={Building2}
                    label={building}
                    nodeKey={buildingKey}
                    indent={0}
                    count={itemCount(buildingCount)}
                  />
                  {expandedNodes.has(buildingKey) && Object.entries(floors).map(([floor, rooms]) => {
                    const floorKey = `${building}|${floor}`
                    const floorLocs = Object.values(rooms).flatMap(cabinets =>
                      Object.values(cabinets).flat()
                    )
                    return (
                      <div key={floor}>
                        <NodeRow
                          icon={Layers}
                          label={floor}
                          nodeKey={floorKey}
                          indent={1}
                          count={itemCount(floorLocs)}
                        />
                        {expandedNodes.has(floorKey) && Object.entries(rooms).map(([room, cabinets]) => {
                          const roomKey = `${building}|${floor}|${room}`
                          const roomLocs = Object.values(cabinets).flat()
                          return (
                            <div key={room}>
                              <NodeRow
                                icon={DoorOpen}
                                label={room}
                                nodeKey={roomKey}
                                indent={2}
                                count={itemCount(roomLocs)}
                              />
                              {expandedNodes.has(roomKey) && Object.entries(cabinets).map(([cabinet, locs]) => {
                                const cabinetKey = `${building}|${floor}|${room}|${cabinet}`
                                return (
                                  <div key={cabinet}>
                                    <NodeRow
                                      icon={Archive}
                                      label={cabinet}
                                      nodeKey={cabinetKey}
                                      indent={3}
                                      count={itemCount(locs)}
                                    />
                                    {expandedNodes.has(cabinetKey) && locs.map(loc => (
                                      <NodeRow
                                        key={loc.id}
                                        icon={Archive}
                                        label={loc.drawer}
                                        nodeKey={loc.id}
                                        indent={4}
                                        count={loc.items?.length ?? 0}
                                        isLeaf
                                        loc={loc}
                                      />
                                    ))}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )
            })}
            {Object.keys(displayTree).length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No locations match your search.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {!selectedLocation ? (
          <div className="card flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-lab-mauve/10 flex items-center justify-center">
              <MapPin size={32} className="text-lab-mauve/50" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700">Select a location to view details</p>
              <p className="text-sm text-gray-400 mt-1">Click any drawer-level node in the tree</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="card">
              <LocationBreadcrumb location={selectedLocation} />
              {selectedLocation.description && (
                <p className="text-sm text-gray-500 mt-2">{selectedLocation.description}</p>
              )}
            </div>

            {/* QR Code */}
            <div className="card">
              <h3 className="section-title mb-3">📟 Location QR Code</h3>
              <div className="flex items-center gap-6">
                <div className="border-2 border-dashed border-lab-slate/40 rounded-xl p-6 flex flex-col items-center gap-2 bg-gray-50 min-w-[140px]">
                  <QrCode size={48} className="text-gray-400" />
                  <p className="font-mono text-xs font-semibold text-gray-700">{selectedLocation.qrCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Scan to access this location</p>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                    Staff and students can scan this QR code to quickly navigate to this storage location
                    and view or borrow items stored here.
                  </p>
                  <button className="btn-secondary mt-3 text-sm flex items-center gap-2">
                    <Printer size={14} /> Print QR Code
                  </button>
                </div>
              </div>
            </div>

            {/* Items Stored Here */}
            <div className="card">
              <h3 className="section-title mb-3">
                📦 Items Stored Here
                <span className="ml-2 text-sm font-normal text-gray-400">({locationItems.length} items)</span>
              </h3>
              {locationItems.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No items stored at this location.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-lab-slate/20 text-left">
                        <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
                        <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Available</th>
                        <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Total</th>
                        <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {locationItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{item.image}</span>
                              <span className="font-medium text-gray-800">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4 text-right font-medium text-lab-sage">
                            {item.quantity?.available ?? 0}
                          </td>
                          <td className="py-2.5 pr-4 text-right text-gray-500">
                            {item.quantity?.total ?? 0}
                          </td>
                          <td className="py-2.5 pr-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="py-2.5">
                            <button className="text-xs text-lab-mauve hover:text-lab-mauve/70 font-medium px-2 py-1 rounded-md hover:bg-lab-mauve/10 transition-colors">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="card">
              <h3 className="section-title mb-3">⚡ Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary flex items-center gap-2 text-sm">
                  <Printer size={15} /> Print QR
                </button>
                <button className="btn-secondary flex items-center gap-2 text-sm">
                  <MoveRight size={15} /> Move Items
                </button>
                <button className="btn-secondary flex items-center gap-2 text-sm">
                  <Tag size={15} /> Update Label
                </button>
                <button className="btn-secondary flex items-center gap-2 text-sm text-red-500 hover:bg-red-50">
                  <AlertCircle size={15} /> Report Issue
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
