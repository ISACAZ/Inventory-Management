import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users as UsersIcon,
  ScrollText,
  QrCode as QrCodeIcon,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit,
  Eye,
  Download,
  Printer,
  Plus,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Clock,
  FileText,
  Wrench,
  LogIn,
  LogOut,
  AlertCircle,
  Copy,
  ExternalLink,
  MoreHorizontal,
  LucideQrCode,
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
import { users, items, stats } from "../data/mockData";

// ---- Constants ----
const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: UsersIcon },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
  { id: "qr", label: "QR Generator", icon: QrCodeIcon },
];

const QUICK_ACTIONS = [
  {
    id: "add-item",
    label: "Add Item",
    icon: Plus,
    color: "bg-primary-50 text-primary-600",
  },
  {
    id: "add-user",
    label: "Add User",
    icon: UserCheck,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "scan-qr",
    label: "Scan QR",
    icon: QrCodeIcon,
    color: "bg-amber-50 text-amber-600",
  },
  {
    id: "backup",
    label: "Backup Data",
    icon: Download,
    color: "bg-green-50 text-green-600",
  },
];

const STATUS_CONFIG = {
  active: { bg: "bg-green-50", text: "text-green-700", label: "Active" },
  disabled: { bg: "bg-red-50", text: "text-red-700", label: "Disabled" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
};

const AUDIT_CATEGORIES = [
  "all",
  "users",
  "inventory",
  "reports",
  "borrows",
  "auth",
  "maintenance",
  "roles",
  "system",
  "qr",
  "export",
];

const MOCK_AUDIT_LOGS = [
  {
    id: "log1",
    timestamp: "2026-06-22T14:32:00",
    user: "Dr. Sarah Chen",
    action: "User Updated",
    details: "Changed role for Daniel Wright to Student",
    category: "users",
  },
  {
    id: "log2",
    timestamp: "2026-06-22T13:15:00",
    user: "James Rodriguez",
    action: "Item Created",
    details: "Added new item: Spectrophotometer UV-2600",
    category: "inventory",
  },
  {
    id: "log3",
    timestamp: "2026-06-22T11:45:00",
    user: "Dr. Sarah Chen",
    action: "Report Generated",
    details: "Generated Inventory Report (PDF)",
    category: "reports",
  },
  {
    id: "log4",
    timestamp: "2026-06-22T10:20:00",
    user: "Prof. Emily Watson",
    action: "Borrow Approved",
    details: "Approved borrow request for PCR Thermal Cycler",
    category: "borrows",
  },
  {
    id: "log5",
    timestamp: "2026-06-22T09:00:00",
    user: "Alex Thompson",
    action: "Login",
    details: "Successful login from Chrome on Windows",
    category: "auth",
  },
  {
    id: "log6",
    timestamp: "2026-06-21T16:30:00",
    user: "James Rodriguez",
    action: "Maintenance Scheduled",
    details: "Scheduled calibration for Analytical Balance",
    category: "maintenance",
  },
  {
    id: "log7",
    timestamp: "2026-06-21T14:10:00",
    user: "Dr. Sarah Chen",
    action: "Role Updated",
    details: "Modified Lab Assistant permissions",
    category: "roles",
  },
  {
    id: "log8",
    timestamp: "2026-06-21T11:00:00",
    user: "System",
    action: "Backup Created",
    details: "Automated daily backup completed",
    category: "system",
  },
  {
    id: "log9",
    timestamp: "2026-06-21T09:30:00",
    user: "Laura Kim",
    action: "QR Generated",
    details: "Generated QR code for item: Centrifuge Eppendorf",
    category: "qr",
  },
  {
    id: "log10",
    timestamp: "2026-06-21T08:00:00",
    user: "Daniel Wright",
    action: "Login Failed",
    details: "Failed login attempt - account disabled",
    category: "auth",
  },
  {
    id: "log11",
    timestamp: "2026-06-20T15:20:00",
    user: "Dr. Sarah Chen",
    action: "Data Exported",
    details: "Exported all inventory data as CSV",
    category: "export",
  },
  {
    id: "log12",
    timestamp: "2026-06-20T13:00:00",
    user: "Prof. Emily Watson",
    action: "Item Reserved",
    details: "Reserved Microscope Olympus BX53 for BIOL 201",
    category: "inventory",
  },
];

const LOG_ACTION_ICONS = {
  "User Updated": { icon: Edit, color: "bg-blue-50 text-blue-600" },
  "Item Created": { icon: Plus, color: "bg-green-50 text-green-600" },
  "Report Generated": { icon: FileText, color: "bg-purple-50 text-purple-600" },
  "Borrow Approved": {
    icon: CheckCircle,
    color: "bg-primary-50 text-primary-600",
  },
  Login: { icon: LogIn, color: "bg-blue-50 text-blue-600" },
  "Login Failed": { icon: AlertCircle, color: "bg-red-50 text-red-600" },
  "Maintenance Scheduled": {
    icon: Wrench,
    color: "bg-amber-50 text-amber-600",
  },
  "Role Updated": { icon: Shield, color: "bg-indigo-50 text-indigo-600" },
  "Backup Created": { icon: Download, color: "bg-green-50 text-green-600" },
  "QR Generated": { icon: QrCodeIcon, color: "bg-amber-50 text-amber-600" },
  "Data Exported": {
    icon: ExternalLink,
    color: "bg-purple-50 text-purple-600",
  },
  "Item Reserved": { icon: Package, color: "bg-primary-50 text-primary-600" },
};

// ---- Skeleton ----
function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} />;
}

// ---- Stat Card ----
function StatCard({ icon: Icon, label, value, sub, colorClass }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex items-start gap-4 p-4"
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0",
          colorClass || "bg-primary-50 text-primary-600",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ---- QR Pattern Generator ----
function QRPattern({ code }) {
  // Generate a pseudo QR-like grid pattern based on the code
  const size = 21;
  const cells = useMemo(() => {
    const grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => false),
    );
    // Generate a seeded pattern based on code string
    let hash = 0;
    for (let i = 0; i < (code || "LABFLOW").length; i++) {
      hash = (hash << 5) - hash + (code || "LABFLOW").charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);
    // Finders (top-left, top-right, bottom-left)
    const drawFinder = (r, c) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          const rr = r + i;
          const cc = c + j;
          if (rr < size && cc < size) {
            grid[rr][cc] =
              i === 0 ||
              i === 6 ||
              j === 0 ||
              j === 6 ||
              (i >= 2 && i <= 4 && j >= 2 && j <= 4);
          }
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);
    // Fill remaining with seeded pattern
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c]) continue;
        const val = (seed * (r * size + c + 1)) % 1000 > 500;
        grid[r][c] = val;
      }
    }
    return grid;
  }, [code]);

  return (
    <div className="flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-xl shadow-inner border-2 border-gray-200">
        <div
          className="grid border-4 border-gray-900 rounded-sm overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            width: `${Math.min(280, size * 13)}px`,
            height: `${Math.min(280, size * 13)}px`,
          }}
        >
          {cells.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={cn(
                  "aspect-square",
                  cell ? "bg-gray-900" : "bg-white",
                )}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Main Component ----
export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [auditCategory, setAuditCategory] = useState("all");
  const [auditSearch, setAuditSearch] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrGenerated, setQrGenerated] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const adminUsers = useMemo(() => users, []);

  const filteredUsers = useMemo(() => {
    let result = [...adminUsers];
    if (userStatusFilter !== "all") {
      result = result.filter(
        (u) =>
          u.status === userStatusFilter ||
          (!u.status && userStatusFilter === "active"),
      );
    }
    if (userSearch) {
      const q = userSearch.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q),
      );
    }
    return result;
  }, [adminUsers, userStatusFilter, userSearch]);

  const filteredAuditLogs = useMemo(() => {
    let result = [...MOCK_AUDIT_LOGS];
    if (auditCategory !== "all") {
      result = result.filter((log) => log.category === auditCategory);
    }
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      result = result.filter(
        (log) =>
          log.user.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q),
      );
    }
    return result;
  }, [auditCategory, auditSearch]);

  const handleDisableUser = (user) => {
    toast.success(`${user.name} has been disabled`, {
      description: "The user will no longer have access to the system",
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    if (activeTab !== "users") setActiveTab("users");
    toast.info(`Editing ${user.name}`, {
      description: "User edit form opened",
    });
  };

  const handleGenerateQR = async () => {
    if (!qrCode.trim()) {
      toast.error("Please enter an item code");
      return;
    }
    setQrLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setQrGenerated(qrCode);
    setQrLoading(false);
    toast.success("QR code generated successfully", {
      description: `QR code for ${qrCode} is ready`,
    });
  };

  const handleDownloadQR = () => {
    toast.success("QR code downloaded as PNG", {
      description: `QR-${qrGenerated}.png saved to downloads`,
    });
  };

  const handlePrintQR = () => {
    toast.success("QR code sent to printer", {
      description: "Print job has been queued",
    });
  };

  const computedStats = useMemo(
    () => ({
      totalItems: stats?.totalItems || 0,
      totalUsers: users.length,
      activeBorrows: stats?.borrowedItems || 0,
      systemHealth: "98.7%",
    }),
    [],
  );

  // Loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="flex gap-6 h-full">
          <div className="w-56 flex-shrink-0 space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="lg:sticky lg:top-6 space-y-1">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                System administration
              </p>
            </div>
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-primary-500",
                  activeTab === tab.id
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={Package}
                    label="Total Items"
                    value={computedStats.totalItems.toLocaleString()}
                    colorClass="bg-primary-50 text-primary-600"
                  />
                  <StatCard
                    icon={UsersIcon}
                    label="Total Users"
                    value={computedStats.totalUsers}
                    colorClass="bg-blue-50 text-blue-600"
                  />
                  <StatCard
                    icon={ArrowLeftRight}
                    label="Active Borrows"
                    value={computedStats.activeBorrows}
                    colorClass="bg-amber-50 text-amber-600"
                  />
                  <StatCard
                    icon={ShieldCheck}
                    label="System Health"
                    value={computedStats.systemHealth}
                    sub="All systems operational"
                    colorClass="bg-green-50 text-green-600"
                  />
                </div>

                {/* Quick Actions */}
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          if (action.id === "add-item")
                            toast.info("Add Item dialog opened");
                          else if (action.id === "add-user")
                            toast.info("Add User dialog opened");
                          else if (action.id === "scan-qr")
                            toast.info("QR Scanner opened");
                          else if (action.id === "backup")
                            toast.success("Backup initiated", {
                              description: "Data backup will complete shortly",
                            });
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-primary-500",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg",
                            action.color,
                          )}
                        >
                          <action.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* System Info */}
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                    System Info
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">Version</span>
                      <span className="font-medium text-gray-900">
                        LabFlow v2.1.0
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">Last Backup</span>
                      <span className="font-medium text-gray-900">
                        {formatDate("2026-06-22")}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">Database Size</span>
                      <span className="font-medium text-gray-900">1.4 GB</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Uptime</span>
                      <span className="font-medium text-gray-900">47 days</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Search */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="input pl-9"
                    />
                  </div>
                  {/* Status filter */}
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="input w-auto min-h-[44px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Users Table */}
                <div className="card p-0 overflow-hidden">
                  {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <UsersIcon className="h-10 w-10 text-gray-300 mb-3" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        No users found
                      </h3>
                      <p className="text-xs text-gray-500">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                              User
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                              Email
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                              Role
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                              Department
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                              Status
                            </th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredUsers.map((user, idx) => {
                            const statusInfo =
                              STATUS_CONFIG[user.status] ||
                              STATUS_CONFIG.active;
                            return (
                              <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="hover:bg-gray-50/50"
                              >
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        user.avatar ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7C8D7D&color=fff&size=64`
                                      }
                                      alt={user.name}
                                      className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                                      loading="lazy"
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                      {user.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-sm text-gray-600">
                                  {user.email}
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="badge bg-gray-100 text-gray-700 capitalize text-xs">
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-sm text-gray-600">
                                  {truncate(user.department, 25)}
                                </td>
                                <td className="px-5 py-3.5">
                                  <span
                                    className={cn(
                                      "badge",
                                      statusInfo.bg,
                                      statusInfo.text,
                                    )}
                                  >
                                    {statusInfo.label}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEditUser(user)}
                                      className="btn btn-ghost p-2 min-h-0 rounded-lg"
                                      title="Edit user"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDisableUser(user)}
                                      className="btn btn-ghost p-2 min-h-0 rounded-lg text-red-500 hover:bg-red-50"
                                      title={
                                        user.status === "disabled"
                                          ? "Enable user"
                                          : "Disable user"
                                      }
                                    >
                                      {user.status === "disabled" ? (
                                        <UserCheck className="h-4 w-4" />
                                      ) : (
                                        <UserX className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === "audit" && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Search */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search audit logs..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="input pl-9"
                    />
                  </div>
                  {/* Category filter */}
                  <select
                    value={auditCategory}
                    onChange={(e) => setAuditCategory(e.target.value)}
                    className="input w-auto min-h-[44px] capitalize"
                  >
                    {AUDIT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audit Logs Table */}
                <div className="card p-0 overflow-hidden">
                  {filteredAuditLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <ScrollText className="h-10 w-10 text-gray-300 mb-3" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        No audit logs found
                      </h3>
                      <p className="text-xs text-gray-500">
                        Try adjusting your filters
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                              Action
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                              User
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                              Details
                            </th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                              Timestamp
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredAuditLogs.map((log, idx) => {
                            const actionInfo = LOG_ACTION_ICONS[log.action] || {
                              icon: Eye,
                              color: "bg-gray-50 text-gray-600",
                            };
                            const ActionIcon = actionInfo.icon;
                            return (
                              <motion.tr
                                key={log.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="hover:bg-gray-50/50"
                              >
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-lg",
                                        actionInfo.color,
                                      )}
                                    >
                                      <ActionIcon className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {log.action}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-sm text-gray-600">
                                  {log.user}
                                </td>
                                <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs">
                                  {truncate(log.details, 60)}
                                </td>
                                <td className="px-5 py-3.5 text-sm text-gray-500 text-right whitespace-nowrap">
                                  {formatDate(log.timestamp)}
                                  <br />
                                  <span className="text-xs text-gray-400">
                                    {new Date(log.timestamp).toLocaleTimeString(
                                      "en-US",
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                  </span>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* QR Generator Tab */}
            {activeTab === "qr" && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Input */}
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                    Generate QR Code
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="label" htmlFor="qr-input">
                        Item Code or ID
                      </label>
                      <input
                        id="qr-input"
                        type="text"
                        placeholder="e.g., ITEM-122 or QR-ITEM-122"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleGenerateQR()
                        }
                        className="input"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleGenerateQR}
                        disabled={qrLoading}
                        className="btn btn-primary w-full sm:w-auto"
                      >
                        {qrLoading ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Generating...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <QrCodeIcon className="h-4 w-4" />
                            Generate QR
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Display */}
                {qrGenerated ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        QR Code: {qrGenerated}
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownloadQR}
                          className="btn btn-outline min-h-0 py-2 px-3 text-sm"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button
                          onClick={handlePrintQR}
                          className="btn btn-primary min-h-0 py-2 px-3 text-sm"
                        >
                          <Printer className="h-4 w-4" />
                          Print
                        </button>
                      </div>
                    </div>
                    <QRPattern code={qrGenerated} />
                    <p className="text-center text-xs text-gray-400 mt-3">
                      QR-{qrGenerated} &middot; Generated{" "}
                      {new Date().toLocaleString()}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card flex flex-col items-center justify-center py-16 px-4"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                      <QrCodeIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      No QR code generated
                    </h3>
                    <p className="text-xs text-gray-500 text-center max-w-xs">
                      Enter an item code above and click "Generate QR" to create
                      a QR code
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
