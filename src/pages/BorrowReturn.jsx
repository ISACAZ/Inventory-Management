import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowLeftRight,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronDown,
  Calendar,
  User,
  BookOpen,
  Hash,
  FileText,
  Camera,
  Upload,
  QrCode,
  Trash2,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldAlert,
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
import { items, transactions, users } from "../data/mockData";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

/* --- TABS --- */
const TABS = [
  { id: "borrow", label: "Borrow", icon: ArrowLeftRight },
  { id: "return", label: "Return", icon: CheckCircle },
  { id: "my-items", label: "My Items", icon: Package },
  { id: "overdue", label: "Overdue", icon: AlertTriangle },
];

/* --- CONSTANTS --- */
const CONDITIONS = ["excellent", "good", "fair", "poor", "damaged"];

/* --- SKELETONS --- */
function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} />;
}

function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
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

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 mb-4">
        <ShieldAlert className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-700">
        Something went wrong
      </h3>
      <p className="mt-1 text-sm text-gray-400 max-w-xs">
        {message || "An unexpected error occurred."}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline mt-4">
          Try Again
        </button>
      )}
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  variant = "primary",
}) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="card max-w-md w-full p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="btn btn-outline min-h-[44px]">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "btn min-h-[44px]",
              variant === "danger" ? "btn-danger" : "btn-primary",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --- BORROW TAB --- */
function BorrowTab({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [course, setCourse] = useState("");
  const [professor, setProfessor] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const searchRef = useRef(null);

  const availableItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return items
      .filter(
        (i) =>
          i.status === "available" &&
          i.availableQuantity > 0 &&
          (i.name.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q) ||
            i.id.toLowerCase().includes(q) ||
            i.tags.some((t) => t.toLowerCase().includes(q))),
      )
      .slice(0, 8);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectItem(item) {
    setSelectedItem(item);
    setShowResults(false);
    setSearchQuery(item.name);
    setQuantity(1);
  }

  function handleRequestBorrow() {
    if (!selectedItem) return;
    setShowConfirm(true);
  }

  function handleConfirmBorrow() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setShowConfirm(false);
      toast.success(`Successfully borrowed "${selectedItem.name}"`, {
        description: `Return by ${formatDate(expectedReturn || new Date())}`,
      });
      setSelectedItem(null);
      setSearchQuery("");
      setQuantity(1);
      setPurpose("");
      setCourse("");
      setProfessor("");
      setExpectedReturn("");
    }, 1000);
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div ref={searchRef} className="relative">
        <label className="label">Search Available Items</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            className="input pl-11 pr-10"
            placeholder="Search by name, category, tag..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
              setSelectedItem(null);
            }}
            onFocus={() => setShowResults(true)}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedItem(null);
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-md hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showResults && searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-20 mt-1 w-full rounded-lg border border-gray-100 bg-white shadow-elevated max-h-72 overflow-y-auto scrollbar-thin"
            >
              {availableItems.length === 0 ? (
                <div className="p-4 text-sm text-gray-400 text-center">
                  No available items found
                </div>
              ) : (
                availableItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.category} · {item.availableQuantity} available
                      </p>
                    </div>
                    <span className={cn("badge", getStatusColor(item.status))}>
                      {item.status}
                    </span>
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Item Card */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="card"
          >
            <div className="flex items-start gap-4">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedItem.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="badge badge-neutral">
                    {selectedItem.category}
                  </span>
                  <span
                    className={cn("badge", getStatusColor(selectedItem.status))}
                  >
                    {selectedItem.availableQuantity} available
                  </span>
                  <span
                    className={cn(
                      "badge",
                      getConditionColor(selectedItem.condition),
                    )}
                  >
                    {selectedItem.condition}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {selectedItem.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Borrow Form */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-11 w-11 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    className="input text-center w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(
                          Math.max(1, parseInt(e.target.value) || 1),
                          selectedItem.availableQuantity,
                        ),
                      )
                    }
                    min={1}
                    max={selectedItem.availableQuantity}
                  />
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(selectedItem.availableQuantity, quantity + 1),
                      )
                    }
                    className="h-11 w-11 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-gray-400">
                    of {selectedItem.availableQuantity}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Expected Return Date</label>
                <input
                  type="date"
                  className="input"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Purpose</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  placeholder="Describe what you'll use this item for..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="label">Course</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. ECE 301 - Embedded Systems"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Professor</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Dr. Sarah Chen"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleRequestBorrow}
                disabled={!expectedReturn || !purpose.trim() || submitting}
                className="btn btn-primary min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Request Borrow
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Default state when no item selected */}
      {!selectedItem && !searchQuery && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 mb-4">
            <Search className="h-8 w-8 text-primary-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700">
            Search for an Item to Borrow
          </h3>
          <p className="mt-1 text-sm text-gray-400 max-w-xs">
            Search by name, category, or tag to find available items in the lab.
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirm}
        title="Confirm Borrow Request"
        message={
          selectedItem
            ? `You are about to borrow "${selectedItem.name}" (${quantity}x). Return by ${formatDate(expectedReturn)}.`
            : ""
        }
        confirmLabel={submitting ? "Processing..." : "Confirm Borrow"}
        onConfirm={handleConfirmBorrow}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

/* --- RETURN TAB --- */
function ReturnTab({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [condition, setCondition] = useState("good");
  const [damageNotes, setDamageNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const searchRef = useRef(null);

  const activeBorrows = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.userId === currentUser.id &&
        t.status === "active" &&
        t.type === "borrow",
    );
  }, [currentUser]);

  const filteredBorrows = useMemo(() => {
    if (!searchQuery.trim()) return activeBorrows;
    const q = searchQuery.toLowerCase();
    return activeBorrows.filter((t) => {
      const item = items.find((i) => i.id === t.itemId);
      return (
        item &&
        (item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (t.purpose && t.purpose.toLowerCase().includes(q)))
      );
    });
  }, [activeBorrows, searchQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectBorrow(txn) {
    const item = items.find((i) => i.id === txn.itemId);
    setSelectedTransaction(txn);
    setSelectedItem(item);
    setShowResults(false);
    setSearchQuery(item ? item.name : "");
    setCondition("good");
    setDamageNotes("");
  }

  function handleConfirmReturn() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setShowConfirm(false);
      toast.success(`Successfully returned "${selectedItem?.name || "item"}"`, {
        description: `Condition: ${condition}`,
      });
      setSelectedTransaction(null);
      setSelectedItem(null);
      setSearchQuery("");
      setCondition("good");
      setDamageNotes("");
    }, 1000);
  }

  if (activeBorrows.length === 0 && !searchQuery) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="No Active Borrows"
        description="You don't have any items to return right now."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div ref={searchRef} className="relative">
        <label className="label">Search Your Active Borrows</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            className="input pl-11 pr-10"
            placeholder="Search by item name or purpose..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
              if (!selectedTransaction) setSelectedItem(null);
            }}
            onFocus={() => !selectedTransaction && setShowResults(true)}
          />
          {searchQuery && !selectedTransaction && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-md hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showResults && !selectedTransaction && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-20 mt-1 w-full rounded-lg border border-gray-100 bg-white shadow-elevated max-h-72 overflow-y-auto scrollbar-thin"
            >
              {filteredBorrows.length === 0 ? (
                <div className="p-4 text-sm text-gray-400 text-center">
                  No matching borrows found
                </div>
              ) : (
                filteredBorrows.map((txn) => {
                  const item = items.find((i) => i.id === txn.itemId);
                  return (
                    <button
                      key={txn.id}
                      onClick={() => handleSelectBorrow(txn)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors min-h-[44px]"
                    >
                      <img
                        src={item?.image || ""}
                        alt={item?.name || ""}
                        className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item?.name || "Unknown Item"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Borrowed {formatDate(txn.borrowDate)} · Due{" "}
                          {formatDate(txn.expectedReturn)}
                        </p>
                      </div>
                      <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Borrow Details */}
      <AnimatePresence>
        {selectedTransaction && selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="card"
          >
            <div className="flex items-start gap-4">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedItem.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="badge badge-neutral">
                    {selectedItem.category}
                  </span>
                  <span
                    className={cn(
                      "badge",
                      getConditionColor(selectedItem.condition),
                    )}
                  >
                    {selectedItem.condition}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Borrowed</span>
                    <p className="text-gray-700">
                      {formatDate(selectedTransaction.borrowDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Due Date</span>
                    <p className="text-gray-700">
                      {formatDate(selectedTransaction.expectedReturn)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Quantity</span>
                    <p className="text-gray-700">
                      {selectedTransaction.quantity}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Purpose</span>
                    <p className="text-gray-700 truncate">
                      {selectedTransaction.purpose || "—"}
                    </p>
                  </div>
                  {selectedTransaction.course && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Course</span>
                      <p className="text-gray-700">
                        {selectedTransaction.course}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTransaction(null);
                  setSelectedItem(null);
                  setSearchQuery("");
                }}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Return Form */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="label">Return Condition</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCondition(c)}
                      className={cn(
                        "btn min-h-[44px] capitalize text-sm transition-all",
                        condition === c ? "btn-primary" : "btn-outline",
                      )}
                    >
                      {condition === c && (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Damage Notes (if any)</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  placeholder="Describe any damage, missing parts, or issues..."
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="label">Photo Upload</label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 transition-colors hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer">
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Tap to upload photos
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="btn btn-primary min-h-[44px] disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Confirm Return
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- MY ITEMS TAB --- */
function MyItemsTab({ currentUser }) {
  const myTransactions = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          t.userId === currentUser.id &&
          t.status === "active" &&
          t.type === "borrow",
      )
      .sort((a, b) => new Date(a.expectedReturn) - new Date(b.expectedReturn));
  }, [currentUser]);

  if (myTransactions.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Active Items"
        description="You haven't borrowed any items yet."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-100">
      {/* Table header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="col-span-4">Item</div>
        <div className="col-span-2">Borrowed</div>
        <div className="col-span-2">Due Date</div>
        <div className="col-span-2">Purpose</div>
        <div className="col-span-2">Status</div>
      </div>

      {/* Table body */}
      <div className="divide-y divide-gray-50">
        {myTransactions.map((txn) => {
          const item = items.find((i) => i.id === txn.itemId);
          const isOverdue = new Date(txn.expectedReturn) < new Date();
          return (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-6 py-4 items-center",
                isOverdue && "bg-red-50/50",
              )}
            >
              {/* Item info */}
              <div className="sm:col-span-4 flex items-center gap-3">
                <img
                  src={item?.image || ""}
                  alt={item?.name || ""}
                  className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item?.name || "Unknown Item"}
                  </p>
                  <p className="text-xs text-gray-400">{item?.category}</p>
                </div>
              </div>

              <div className="sm:col-span-2 text-sm text-gray-600">
                <span className="sm:hidden text-xs text-gray-400 mr-1">
                  Borrowed:{" "}
                </span>
                {formatDate(txn.borrowDate)}
              </div>

              <div className="sm:col-span-2 text-sm">
                <span className="sm:hidden text-xs text-gray-400 mr-1">
                  Due:{" "}
                </span>
                <span className={cn(isOverdue && "text-red-600 font-medium")}>
                  {formatDate(txn.expectedReturn)}
                </span>
              </div>

              <div className="sm:col-span-2 text-sm text-gray-600 truncate">
                <span className="sm:hidden text-xs text-gray-400 mr-1">
                  Purpose:{" "}
                </span>
                {truncate(txn.purpose || "—", 20)}
              </div>

              <div className="sm:col-span-2">
                <span
                  className={cn(
                    "badge",
                    isOverdue ? "badge-danger" : "badge-primary",
                  )}
                >
                  {isOverdue ? "Overdue" : "Active"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* --- OVERDUE TAB --- */
function OverdueTab({ currentUser }) {
  const overdueItems = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(
        (t) =>
          t.userId === currentUser.id &&
          (t.status === "overdue" ||
            (t.status === "active" && new Date(t.expectedReturn) < now)),
      )
      .sort((a, b) => new Date(a.expectedReturn) - new Date(b.expectedReturn));
  }, [currentUser]);

  if (overdueItems.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="No Overdue Items"
        description="Great job! You have no overdue items."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100">
        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">
            {overdueItems.length} overdue item
            {overdueItems.length > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-red-600 mt-0.5">
            Please return these items as soon as possible to avoid penalties.
          </p>
        </div>
      </div>

      {overdueItems.map((txn) => {
        const item = items.find((i) => i.id === txn.itemId);
        const daysOverdue = Math.max(
          1,
          Math.ceil(
            (new Date() - new Date(txn.expectedReturn)) / (1000 * 60 * 60 * 24),
          ),
        );
        return (
          <motion.div
            key={txn.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="card border-red-200 bg-red-50/30"
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={item?.image || ""}
                  alt={item?.name || ""}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  !
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900">
                  {item?.name || "Unknown Item"}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="badge badge-neutral text-xs">
                    {item?.category}
                  </span>
                  <span className="badge badge-danger text-xs">
                    {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  <div>
                    <span className="text-gray-400">Borrowed</span>
                    <p className="text-gray-600">
                      {formatDate(txn.borrowDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Was Due</span>
                    <p className="text-red-600 font-medium">
                      {formatDate(txn.expectedReturn)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Purpose</span>
                    <p className="text-gray-600 truncate">
                      {txn.purpose || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* --- MAIN PAGE --- */
export default function BorrowReturn() {
  const [activeTab, setActiveTab] = useState("borrow");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    try {
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const ActiveComponent = {
    borrow: BorrowTab,
    return: ReturnTab,
    "my-items": MyItemsTab,
    overdue: OverdueTab,
  }[activeTab];

  return (
    <PageTransition>
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Borrow & Return
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage equipment borrowing and returns
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isOverdue = tab.id === "overdue";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] relative",
                    activeTab === tab.id
                      ? "bg-white text-gray-900 shadow-soft"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isOverdue && activeTab === tab.id ? "text-red-500" : "",
                    )}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isOverdue && (
                    <span
                      className={cn(
                        "absolute -top-1 -right-1 h-5 w-5 text-[10px] font-bold rounded-full flex items-center justify-center",
                        activeTab === tab.id
                          ? "bg-red-500 text-white"
                          : "bg-red-100 text-red-600",
                      )}
                    >
                      !
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <TableSkeleton rows={4} />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setError(null);
              setLoading(true);
              setTimeout(() => setLoading(false), 600);
            }}
          />
        ) : (
          <ActiveComponent currentUser={currentUser} />
        )}

        {/* Confirm Return Dialog (for Return tab) */}
        <AnimatePresence>
          {/* Note: Return tab's ConfirmDialog is rendered inside the tab component itself */}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
