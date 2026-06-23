import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Bell,
  Palette,
  Shield,
  Camera,
  Mail,
  Building,
  FileText,
  Save,
  RefreshCw,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Globe,
  Key,
  Lock,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Laptop,
  X,
  ExternalLink,
  Download,
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
import { useAuth } from "../hooks/useAuth";

// ---- Constants ----
const SETTINGS_TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

const NOTIFICATION_ITEMS = [
  {
    id: "borrow-updates",
    label: "Borrow Confirmations",
    description: "Status changes for your borrow requests",
  },
  {
    id: "due-reminders",
    label: "Return Reminders",
    description: "Reminders before items are due",
  },
  {
    id: "maintenance",
    label: "Maintenance Alerts",
    description: "Equipment maintenance and calibration notices",
  },
  {
    id: "system",
    label: "Announcements",
    description: "Platform updates and announcements",
  },
];

const THEME_SWATCHES = [
  {
    id: "light",
    name: "Light",
    primary: "#FFFFFF",
    accent: "#7C8D7D",
    bg: "#F5F5F3",
  },
  {
    id: "dark",
    name: "Dark",
    primary: "#1a1a2e",
    accent: "#7C8D7D",
    bg: "#16213e",
  },
  {
    id: "warm",
    name: "Warm",
    primary: "#FFF8F0",
    accent: "#D9966E",
    bg: "#FFF5EC",
  },
  {
    id: "cool",
    name: "Cool",
    primary: "#F0F4F8",
    accent: "#C2CCD6",
    bg: "#E8EEF4",
  },
  {
    id: "system",
    name: "System",
    primary: "#F5F5F3",
    accent: "#7C8D7D",
    bg: "#E5E5E3",
  },
];

const MOCK_SESSIONS = [
  {
    id: "s1",
    device: "Chrome on Windows",
    location: "Campus Lab B",
    ip: "192.168.1.100",
    lastActive: "Now",
    current: true,
  },
  {
    id: "s2",
    device: "Safari on iPhone",
    location: "Library",
    ip: "192.168.1.150",
    lastActive: "3 hours ago",
    current: false,
  },
  {
    id: "s3",
    device: "Firefox on MacOS",
    location: "Home Office",
    ip: "10.0.0.45",
    lastActive: "Yesterday",
    current: false,
  },
  {
    id: "s4",
    device: "Chrome on Windows",
    location: "Campus Lab A",
    ip: "192.168.1.101",
    lastActive: "3 days ago",
    current: false,
  },
];

// ---- Skeleton ----
function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} />;
}

// ---- Toggle Switch ----
function ToggleSwitch({ enabled, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
        enabled ? "bg-primary-500" : "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      role="switch"
      aria-checked={enabled}
    >
      <motion.span
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

// ---- Main Component ----
export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    department: "",
    bio: "",
    avatar: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState({
    email: {
      "borrow-updates": true,
      "due-reminders": true,
      maintenance: true,
      system: false,
    },
    push: {
      "borrow-updates": true,
      "due-reminders": true,
      maintenance: false,
      system: true,
    },
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Appearance state
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [fontSize, setFontSize] = useState(16);

  // Security state
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const { currentUser } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser) {
        setProfile({
          name: currentUser.name || "",
          email: currentUser.email || "",
          department: currentUser.department || "",
          bio:
            currentUser.bio ||
            "Laboratory researcher and equipment specialist.",
          avatar: currentUser.avatar || "",
        });
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentUser]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSavingProfile(false);
    toast.success("Profile updated successfully", {
      description: "Your profile changes have been saved.",
    });
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSavingNotifications(false);
    toast.success("Notification preferences saved", {
      description: "Your notification settings have been updated.",
    });
  };

  const handleToggleNotification = (channel, id) => {
    setNotifications((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [id]: !prev[channel][id],
      },
    }));
  };

  const handleSaveAppearance = () => {
    toast.success("Appearance settings saved", {
      description: `Theme set to "${THEME_SWATCHES.find((t) => t.id === selectedTheme)?.name}" with ${fontSize}px font size.`,
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsSavingSecurity(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSavingSecurity(false);
    setPasswordForm({ current: "", new: "", confirm: "" });
    toast.success("Password changed successfully", {
      description: "Your password has been updated.",
    });
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(
      twoFactorEnabled
        ? "Two-factor authentication disabled"
        : "Two-factor authentication enabled",
      {
        description: twoFactorEnabled
          ? "2FA has been turned off for your account."
          : "Scan the QR code with your authenticator app to complete setup.",
      },
    );
  };

  const handleRevokeSession = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success("Session revoked", {
      description: "The selected session has been terminated.",
    });
  };

  // Loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-52 flex-shrink-0 space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
          <div className="flex-1 card space-y-4 p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="lg:sticky lg:top-6 space-y-1">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your preferences
              </p>
            </div>
            {SETTINGS_TABS.map((tab) => (
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
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="card p-6 space-y-6"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile Information
                </h2>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={
                        profile.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=7C8D7D&color=fff&size=128`
                      }
                      alt={profile.name}
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-100"
                    />
                    <button
                      onClick={() => toast.info("Avatar upload dialog opened")}
                      className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white shadow-md hover:bg-primary-600 transition-colors"
                      title="Change avatar"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{profile.name}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="profile-name">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="profile-name"
                        type="text"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        className="input pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="profile-email">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="profile-email"
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        className="input pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="profile-dept">
                      Department
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="profile-dept"
                        type="text"
                        value={profile.department}
                        onChange={(e) =>
                          setProfile({ ...profile, department: e.target.value })
                        }
                        className="input pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="profile-bio">
                      Bio
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        id="profile-bio"
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        className="input pl-9 min-h-[88px] resize-y"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="btn btn-primary"
                  >
                    {isSavingProfile ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </motion.div>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                {/* Email Notifications */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Email Notifications
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {NOTIFICATION_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-medium text-gray-900">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                        <ToggleSwitch
                          enabled={notifications.email[item.id]}
                          onChange={() =>
                            handleToggleNotification("email", item.id)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-accent-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Push Notifications
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {NOTIFICATION_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-medium text-gray-900">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                        <ToggleSwitch
                          enabled={notifications.push[item.id]}
                          onChange={() =>
                            handleToggleNotification("push", item.id)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isSavingNotifications}
                    className="btn btn-primary"
                  >
                    {isSavingNotifications ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                {/* Theme Swatches */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Theme
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {THEME_SWATCHES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={cn(
                          "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-primary-500",
                          selectedTheme === theme.id
                            ? "border-primary-500 shadow-sm"
                            : "border-gray-100 hover:border-gray-200",
                        )}
                      >
                        <div
                          className="h-12 w-12 rounded-lg border border-gray-200 overflow-hidden"
                          style={{ backgroundColor: theme.bg }}
                        >
                          <div
                            className="h-2 w-full"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {theme.name}
                        </span>
                        {selectedTheme === theme.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Font Size
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">A</span>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      step="1"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1 h-2 rounded-full appearance-none bg-gray-200 cursor-pointer accent-primary-500"
                      aria-label="Font size"
                    />
                    <span className="text-lg text-gray-500 font-bold">A</span>
                    <span className="text-sm font-medium text-gray-700 w-10 text-right">
                      {fontSize}px
                    </span>
                  </div>
                  <div
                    className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <p className="text-gray-900 font-medium">Preview Text</p>
                    <p className="text-gray-500">
                      This is how your content will look at {fontSize}px.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveAppearance}
                    className="btn btn-primary"
                  >
                    <Save className="h-4 w-4" />
                    Save Appearance
                  </button>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                {/* Change Password */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Change Password
                    </h2>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {[
                      { id: "current", label: "Current Password" },
                      { id: "new", label: "New Password" },
                      { id: "confirm", label: "Confirm New Password" },
                    ].map((field) => (
                      <div key={field.id}>
                        <label className="label" htmlFor={`pw-${field.id}`}>
                          {field.label}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            id={`pw-${field.id}`}
                            type={showPasswords[field.id] ? "text" : "password"}
                            value={passwordForm[field.id]}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                [field.id]: e.target.value,
                              })
                            }
                            className="input pl-9 pr-10"
                            placeholder={field.label}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                [field.id]: !showPasswords[field.id],
                              })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 min-h-0 p-1"
                            tabIndex={-1}
                          >
                            {showPasswords[field.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="submit"
                      disabled={isSavingSecurity}
                      className="btn btn-primary"
                    >
                      {isSavingSecurity ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Update Password
                        </span>
                      )}
                    </button>
                  </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary-600" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Two-Factor Authentication
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={twoFactorEnabled}
                      onChange={handleToggle2FA}
                    />
                  </div>
                  {twoFactorEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-green-50 rounded-lg p-4 flex items-start gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          2FA is enabled
                        </p>
                        <p className="text-xs text-green-600 mt-0.5">
                          Your account is protected with two-factor
                          authentication via authenticator app.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Session Management */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Active Sessions
                    </h2>
                  </div>
                  {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Laptop className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">
                        No active sessions
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {sessions.map((session, idx) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0",
                                session.current
                                  ? "bg-primary-50 text-primary-600"
                                  : "bg-gray-50 text-gray-500",
                              )}
                            >
                              {session.device.includes("iPhone") ? (
                                <Smartphone className="h-4 w-4" />
                              ) : (
                                <Monitor className="h-4 w-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {session.device}
                                </p>
                                {session.current && (
                                  <span className="badge bg-primary-50 text-primary-700 text-[10px]">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {session.location} &middot; {session.ip}{" "}
                                &middot; {session.lastActive}
                              </p>
                            </div>
                          </div>
                          {!session.current && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              className="btn btn-ghost p-2 min-h-0 rounded-lg text-red-500 hover:bg-red-50 flex-shrink-0"
                              title="Revoke session"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {sessions.length > 1 && (
                    <button
                      onClick={() => {
                        setSessions((prev) => prev.filter((s) => s.current));
                        toast.success("All other sessions revoked", {
                          description:
                            "You are now only signed in on this device.",
                        });
                      }}
                      className="btn btn-outline w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out All Other Sessions
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
