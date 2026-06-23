import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronRight,
  MapPin,
  Building2,
  DoorOpen,
  QrCode,
  Package,
  Layers,
  BarChart3,
  Home,
  Navigation,
  ShieldAlert,
  Maximize2,
  Minimize2,
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import {
  cn,
  formatDate,
  formatRelative,
  formatCurrency,
  getStatusColor,
  getConditionColor,
  truncate,
} from "../lib/utils";
import { locations, items as inventoryItems } from "../data/mockData";

/* --- CONSTANTS --- */
const TYPE_ICONS = {
  building: Building2,
  floor: Layers,
  room: DoorOpen,
  storage: Package,
};
const TYPE_COLORS = {
  building: "text-primary-600 bg-primary-50",
  floor: "text-blue-600 bg-blue-50",
  room: "text-amber-600 bg-amber-50",
  storage: "text-purple-600 bg-purple-50",
};

/* --- SKELETONS --- */
function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} />;
}

function TreeSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="card space-y-4 p-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* --- COMPONENTS --- */
function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 mb-4">
        <Icon className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      <p className="mt-1 text-sm text-gray-400 max-w-xs">{description}</p>
    </div>
  );
}

/* --- TREE NODE --- */
function TreeNode({
  node,
  children,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
  depth = 0,
}) {
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const TypeIcon = TYPE_ICONS[node.type] || MapPin;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) onToggle(node.id);
        }}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-150 min-h-[44px]",
          isSelected
            ? "bg-primary-50 text-primary-700 font-medium"
            : "text-gray-600 hover:bg-gray-50",
        )}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {/* Expand/collapse chevron */}
        <span
          className={cn(
            "h-4 w-4 flex items-center justify-center transition-transform duration-200 flex-shrink-0",
            isExpanded && "rotate-90",
            !hasChildren && "invisible",
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </span>

        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0",
            TYPE_COLORS[node.type] || "text-gray-500 bg-gray-100",
          )}
        >
          <TypeIcon className="h-3.5 w-3.5" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{node.name}</p>
          <p className="text-[11px] text-gray-400 capitalize">{node.type}</p>
        </div>

        {node.currentItems > 0 && (
          <span className="text-[11px] text-gray-400 flex-shrink-0">
            {node.currentItems}
          </span>
        )}
      </button>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children.map((child) => (
              <TreeNode
                key={child.node.id}
                node={child.node}
                children={child.children}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- BREADCRUMB --- */
function Breadcrumb({ path }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm flex-wrap">
      <Home className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
      {path.map((loc, idx) => (
        <span key={loc.id} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />
          <span
            className={cn(
              "transition-colors",
              idx === path.length - 1
                ? "text-gray-900 font-medium"
                : "text-gray-400",
            )}
          >
            {loc.name}
          </span>
        </span>
      ))}
    </nav>
  );
}

/* --- LOCATION DETAIL --- */
function LocationDetail({ location, items }) {
  if (!location) {
    return (
      <EmptyState
        icon={MapPin}
        title="Select a Location"
        description="Choose a location from the tree to view its details and items."
      />
    );
  }

  const TypeIcon = TYPE_ICONS[location.type] || MapPin;
  const utilization =
    location.capacity > 0
      ? Math.round((location.currentItems / location.capacity) * 100)
      : 0;

  return (
    <motion.div
      key={location.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Location header */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0",
              TYPE_COLORS[location.type] || "text-gray-500 bg-gray-100",
            )}
          >
            <TypeIcon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{location.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={cn(
                  "badge capitalize",
                  location.type === "building" && "badge-primary",
                  location.type === "floor" && "badge-info",
                  location.type === "room" && "badge-warning",
                  location.type === "storage" && "badge-neutral",
                )}
              >
                {location.type}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              {location.description}
            </p>
          </div>

          {/* QR Code placeholder */}
          <div className="hidden sm:flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 flex-shrink-0">
            <QrCode className="h-10 w-10 text-gray-300" />
            <span className="text-[10px] text-gray-400 font-mono">
              {location.qrCode}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <Maximize2 className="h-4 w-4 text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Capacity</p>
              <p className="text-lg font-bold text-gray-900">
                {location.capacity}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Package className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Current Items</p>
              <p className="text-lg font-bold text-gray-900">{items.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50">
              <BarChart3 className="h-4 w-4 text-accent-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Utilization</p>
              <p className="text-lg font-bold text-gray-900">{utilization}%</p>
              <div className="mt-1.5 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(utilization, 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    utilization > 80
                      ? "bg-red-400"
                      : utilization > 50
                        ? "bg-accent-400"
                        : "bg-primary-400",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items at this location */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Items at this Location ({items.length})
        </h3>

        {items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Items Here"
            description="This location currently has no items assigned."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.2 }}
                className="card card-interactive p-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[11px] text-gray-400">
                        {item.category}
                      </span>
                      <span
                        className={cn(
                          "badge text-[10px]",
                          getStatusColor(item.status),
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                      <span>
                        {item.availableQuantity}/{item.quantity} avail.
                      </span>
                      <span>{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* --- MAIN PAGE --- */
export default function Locations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-expand first building and select first location on load
  useEffect(() => {
    const buildings = locations.filter((l) => l.parentId === null);
    if (buildings.length > 0) {
      setExpandedIds(new Set([buildings[0].id]));
      setSelectedId(buildings[0].id);
    }
  }, []);

  // Build tree from flat locations
  const locationTree = useMemo(() => {
    const map = {};
    const roots = [];

    locations.forEach((loc) => {
      map[loc.id] = { node: loc, children: [] };
    });

    locations.forEach((loc) => {
      if (loc.parentId && map[loc.parentId]) {
        map[loc.parentId].children.push(map[loc.id]);
      } else if (!loc.parentId) {
        roots.push(map[loc.id]);
      }
    });

    return roots;
  }, []);

  // Filter tree by search
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return locationTree;

    const q = searchQuery.toLowerCase();
    const matchingIds = new Set(
      locations
        .filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.type.toLowerCase().includes(q) ||
            l.id.toLowerCase().includes(q) ||
            (l.description && l.description.toLowerCase().includes(q)),
        )
        .map((l) => l.id),
    );

    // Expand all ancestors of matching nodes
    const newExpanded = new Set(expandedIds);
    locations.forEach((loc) => {
      if (matchingIds.has(loc.id)) {
        let parent = loc.parentId;
        while (parent) {
          newExpanded.add(parent);
          const p = locations.find((l) => l.id === parent);
          parent = p ? p.parentId : null;
        }
      }
    });

    // We'll auto-expand matches in a moment
    setTimeout(() => setExpandedIds(newExpanded), 0);
    return locationTree;
  }, [searchQuery, locationTree]);

  // Flatten tree for rendering with filtering
  const flattenTree = useCallback(
    (nodes, depth = 0) => {
      return nodes.flatMap(({ node, children }) => {
        const matches = !searchQuery.trim() || true; // always render, highlight instead
        if (!matches) return [];
        return [{ node, children, depth }, ...flattenTree(children, depth + 1)];
      });
    },
    [searchQuery],
  );

  const flatNodes = useMemo(
    () => flattenTree(filteredTree),
    [filteredTree, flattenTree],
  );

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedId),
    [selectedId],
  );

  const selectedItems = useMemo(
    () => inventoryItems.filter((item) => item.locationId === selectedId),
    [selectedId],
  );

  const path = useMemo(() => {
    if (!selectedLocation) return [];
    const result = [selectedLocation];
    let parentId = selectedLocation.parentId;
    while (parentId) {
      const parent = locations.find((l) => l.id === parentId);
      if (parent) {
        result.unshift(parent);
        parentId = parent.parentId;
      } else {
        break;
      }
    }
    return result;
  }, [selectedLocation]);

  const handleToggle = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  return (
    <PageTransition>
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Locations
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse and manage lab locations and storage areas
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        {!loading && selectedLocation && (
          <div className="mb-6">
            <Breadcrumb path={path} />
          </div>
        )}

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Location tree */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="card p-3 lg:sticky lg:top-6">
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  className="input pl-10 py-2.5 text-sm"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Tree */}
              {loading ? (
                <TreeSkeleton />
              ) : error ? (
                <div className="p-4 text-sm text-red-500 text-center">
                  {error}
                </div>
              ) : flatNodes.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No Locations Found"
                  description="Try a different search term."
                />
              ) : (
                <div className="max-h-[60vh] overflow-y-auto scrollbar-thin -mx-1">
                  {filteredTree.map(({ node, children }) => (
                    <TreeNode
                      key={node.id}
                      node={node}
                      children={children}
                      selectedId={selectedId}
                      expandedIds={expandedIds}
                      onToggle={handleToggle}
                      onSelect={handleSelect}
                      depth={0}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Location detail */}
          <div className="lg:col-span-8 xl:col-span-9">
            {loading ? (
              <DetailSkeleton />
            ) : error ? (
              <div className="card flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 mb-4">
                  <ShieldAlert className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700">
                  Something went wrong
                </h3>
                <p className="mt-1 text-sm text-gray-400">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    setTimeout(() => setLoading(false), 500);
                  }}
                  className="btn btn-outline mt-4 min-h-[44px]"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <LocationDetail
                location={selectedLocation}
                items={selectedItems}
              />
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
