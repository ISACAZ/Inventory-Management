import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Trophy,
  Medal,
  Star,
  Zap,
  Flame,
  Heart,
  Handshake,
  CheckCircle,
  MapPin,
  Shield,
  Database,
  Crown,
  TrendingUp,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  Sun,
  Lock,
  BarChart3,
  Calendar,
  Clock,
  Filter,
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
import { leaderboardUsers, items, departmentUsage } from "../data/mockData";

// ---- Constants ----
const PERIODS = [
  { id: "month", label: "This Month" },
  { id: "semester", label: "This Semester" },
  { id: "all", label: "All Time" },
];

const TABS = [
  { id: "individual", label: "Individual Rankings", icon: Users },
  { id: "department", label: "Department Rankings", icon: BarChart3 },
  { id: "badges", label: "Badge Showcase", icon: Award },
];

const PODIUM_COLORS = {
  1: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    icon: "text-yellow-500",
    accent: "bg-yellow-400",
  },
  2: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-600",
    icon: "text-gray-400",
    accent: "bg-gray-300",
  },
  3: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "text-amber-500",
    accent: "bg-amber-600",
  },
};

const ALL_BADGES = [
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Return items before due date 10 times",
    icon: Sun,
    points: 100,
  },
  {
    id: "power-borrower",
    name: "Power Borrower",
    description: "Borrow 50+ items total",
    icon: Zap,
    points: 200,
  },
  {
    id: "perfect-return",
    name: "Perfect Return",
    description: "Zero late returns for 3 months",
    icon: CheckCircle,
    points: 150,
  },
  {
    id: "lab-star",
    name: "Lab Star",
    description: "Complete 5 lab courses with perfect record",
    icon: Star,
    points: 300,
  },
  {
    id: "community-helper",
    name: "Community Helper",
    description: "Help 10 other students with equipment",
    icon: Heart,
    points: 100,
  },
  {
    id: "helper-badge",
    name: "Helper Badge",
    description: "Assist lab staff 5 times",
    icon: Handshake,
    points: 80,
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "30-day borrowing streak",
    icon: Flame,
    points: 250,
  },
  {
    id: "inventory-guru",
    name: "Inventory Guru",
    description: "Know all lab equipment locations",
    icon: MapPin,
    points: 150,
  },
  {
    id: "safety-first",
    name: "Safety First",
    description: "Complete all safety training modules",
    icon: Shield,
    points: 100,
  },
  {
    id: "data-wizard",
    name: "Data Wizard",
    description: "Submit 20 accurate data logs",
    icon: Database,
    points: 120,
  },
];

// ---- Skeleton ----
function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} />;
}

// ---- Podium Card ----
function PodiumCard({ user, rank, index }) {
  const colors = PODIUM_COLORS[rank] || PODIUM_COLORS[3];
  const isFirst = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className={cn(
        "card relative flex flex-col items-center text-center p-5 pt-8 border-2",
        colors.border,
        isFirst
          ? "md:-mt-4 md:order-1 order-2"
          : rank === 2
            ? "order-1"
            : "order-3",
      )}
    >
      {/* Crown for #1 */}
      {isFirst && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-white shadow-lg">
            <Crown className="h-5 w-5" />
          </div>
        </div>
      )}

      {/* Rank badge */}
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold mb-3",
          colors.accent,
          rank === 1 ? "text-white" : "text-white",
        )}
      >
        {rank}
      </div>

      {/* Avatar */}
      <img
        src={
          user.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7C8D7D&color=fff&size=128`
        }
        alt={user.name}
        className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md mb-3"
        loading="lazy"
      />

      {/* Name */}
      <h3 className="font-semibold text-gray-900 mb-0.5">{user.name}</h3>
      <p className="text-xs text-gray-500 mb-2">{user.department}</p>

      {/* Points */}
      <div className="flex items-center gap-1 mb-2">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        <span className="text-lg font-bold text-gray-900">
          {user.points.toLocaleString()}
        </span>
        <span className="text-xs text-gray-400">pts</span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1 flex-wrap justify-center mb-2">
        {user.badges.slice(0, 3).map((badge, i) => (
          <span
            key={i}
            className="badge bg-primary-50 text-primary-700 text-[10px]"
          >
            {typeof badge === "string" ? badge : badge.name}
          </span>
        ))}
        {user.badges.length > 3 && (
          <span className="text-[10px] text-gray-400">
            +{user.badges.length - 3}
          </span>
        )}
      </div>

      {/* Streak */}
      {user.streak > 0 && (
        <div className="flex items-center gap-1 mt-auto">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-xs font-medium text-orange-600">
            {user.streak} day streak
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ---- Ranked List Item ----
function RankedListItem({ user, rank, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors rounded-lg"
    >
      {/* Rank */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600 flex-shrink-0">
        {rank}
      </div>

      {/* Avatar */}
      <img
        src={
          user.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7C8D7D&color=fff&size=64`
        }
        alt={user.name}
        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
        loading="lazy"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-500">{user.department}</p>
      </div>

      {/* Badges count */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Award className="h-3.5 w-3.5" />
        {user.badges.length}
      </div>

      {/* Streak */}
      {user.streak > 0 && (
        <div className="flex items-center gap-1 text-xs text-orange-600">
          <Flame className="h-3.5 w-3.5" />
          {user.streak}d
        </div>
      )}

      {/* Points */}
      <div className="text-right flex-shrink-0 w-24">
        <p className="text-sm font-bold text-gray-900">
          {user.points.toLocaleString()}
        </p>
        <p className="text-[10px] text-gray-400">points</p>
      </div>
    </motion.div>
  );
}

// ---- Department Bar ----
function DepartmentBar({ dept, maxPoints, index }) {
  const percent = maxPoints > 0 ? (dept.totalPoints / maxPoints) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{dept.name}</span>
          <span className="text-xs text-gray-400">
            ({dept.memberCount} members)
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {dept.totalPoints.toLocaleString()} pts
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{
            delay: index * 0.1 + 0.3,
            duration: 0.6,
            ease: "easeOut",
          }}
          className={cn(
            "h-full rounded-full",
            index === 0
              ? "bg-primary-500"
              : index === 1
                ? "bg-accent-500"
                : "bg-secondary-300",
          )}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Avg: {dept.avgPoints} pts/member</span>
        <span>Rank #{dept.rank}</span>
      </div>
    </motion.div>
  );
}

// ---- Badge Card ----
function BadgeCard({ badge, earned, index }) {
  const Icon = badge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "card flex flex-col items-center text-center p-4 transition-all",
        !earned && "opacity-50 grayscale",
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full mb-3",
          earned
            ? "bg-primary-50 text-primary-600"
            : "bg-gray-100 text-gray-400",
        )}
      >
        {earned ? <Icon className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
      </div>
      <h4 className="text-sm font-semibold text-gray-900 mb-1">{badge.name}</h4>
      <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 text-yellow-500" />
        <span className="text-xs font-medium text-gray-700">
          {badge.points} pts
        </span>
      </div>
      {!earned && (
        <span className="badge bg-gray-100 text-gray-500 mt-2 text-[10px]">
          Locked
        </span>
      )}
    </motion.div>
  );
}

// ---- Main Component ----
export default function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("individual");
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  // Compute department rankings from departmentUsage
  const departmentRankings = useMemo(() => {
    if (!departmentUsage || departmentUsage.length === 0) {
      return [
        {
          name: "Electrical and Computer Engineering",
          totalPoints: 8990,
          memberCount: 48,
          avgPoints: 187,
          rank: 1,
        },
        {
          name: "Biology",
          totalPoints: 7230,
          memberCount: 42,
          avgPoints: 172,
          rank: 2,
        },
        {
          name: "Physics",
          totalPoints: 5620,
          memberCount: 35,
          avgPoints: 160,
          rank: 3,
        },
      ];
    }

    // Sort by value and create rankings
    return departmentUsage
      .map((d, i) => ({
        name: d.name,
        totalPoints: d.value * 100,
        memberCount: Math.floor(d.value * 6),
        avgPoints: Math.round(d.value * 20),
        rank: i + 1,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((d, i) => ({ ...d, rank: i + 1 }));
  }, []);

  const maxDeptPoints = Math.max(
    ...departmentRankings.map((d) => d.totalPoints),
    1,
  );

  // Get earned badge IDs from top users (all badges that have been earned by someone)
  const earnedBadgeIds = useMemo(() => {
    const earned = new Set();
    leaderboardUsers.forEach((u) => {
      u.badges.forEach((b) => {
        if (typeof b === "string") earned.add(b);
        else earned.add(b.id || b);
      });
    });
    return earned;
  }, []);

  // Top 3 podium users
  const podiumUsers = useMemo(() => {
    return leaderboardUsers
      .filter((u) => u.rank <= 3)
      .sort((a, b) => a.rank - b.rank);
  }, []);

  // Rest of ranked users (4-10)
  const rankedUsers = useMemo(() => {
    return leaderboardUsers
      .filter((u) => u.rank >= 4 && u.rank <= 10)
      .sort((a, b) => a.rank - b.rank);
  }, []);

  // Loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="page-container space-y-6">
          <div className="page-header">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-28 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
          <div className="card space-y-3">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="page-container space-y-6">
        {/* Header */}
        <div className="page-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                <Trophy className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
            </div>
            <p className="text-sm text-gray-500">
              See who's leading the lab with points, badges, and achievements
            </p>
          </div>
          {/* Period filter */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-primary-500",
                  period === p.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-500",
                activeTab === tab.id
                  ? "text-primary-600"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="leaderboard-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Individual Rankings Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "individual" && (
            <motion.div
              key="individual"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* Podium - Top 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {podiumUsers.map((user, i) => (
                  <PodiumCard
                    key={user.id || user.userId}
                    user={user}
                    rank={user.rank}
                    index={i}
                  />
                ))}
              </div>

              {/* Ranked List 4-10 */}
              <div className="card p-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Rankings 4–10
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {rankedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <Users className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">
                        No more ranked users
                      </p>
                    </div>
                  ) : (
                    rankedUsers.map((user, i) => (
                      <RankedListItem
                        key={user.id || user.userId}
                        user={user}
                        rank={user.rank}
                        index={i}
                      />
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Department Rankings Tab */}
          {activeTab === "department" && (
            <motion.div
              key="department"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="card space-y-6 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Department Rankings by Points
                </h3>
              </div>
              {departmentRankings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">
                    No department data available
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {departmentRankings.map((dept, i) => (
                    <DepartmentBar
                      key={dept.name}
                      dept={dept}
                      maxPoints={maxDeptPoints}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Badge Showcase Tab */}
          {activeTab === "badges" && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Badge Showcase
                </h3>
                <span className="text-sm text-gray-400 ml-2">
                  ({earnedBadgeIds.size}/{ALL_BADGES.length} earned by
                  community)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {ALL_BADGES.map((badge, i) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={earnedBadgeIds.has(badge.id)}
                    index={i}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
