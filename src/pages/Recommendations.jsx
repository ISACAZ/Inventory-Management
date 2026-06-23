import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  Package,
  TrendingUp,
  ChevronDown,
  Plus,
  ShoppingCart,
  ArrowRight,
  Tag,
  Info,
  Filter,
  BarChart3,
  Zap,
  Star,
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
import { recommendations, items } from "../data/mockData";

// ---- Skeleton ----
function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} />;
}

// ---- Recommended Item Card ----
function RecommendationCard({
  recommendation,
  itemMap,
  getItemName,
  getItemImage,
  onAddAll,
}) {
  const sourceItem = itemMap[recommendation.itemId];
  const sourceName =
    sourceItem?.name || recommendation.itemId || "Unknown Item";
  const relatedItems = recommendation.relatedItemIds
    .map((id) => itemMap[id])
    .filter(Boolean);
  const confidencePercent = Math.round((recommendation.confidence || 0) * 100);

  const handleAddAll = (e) => {
    e.stopPropagation();
    onAddAll(recommendation);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="card card-interactive p-5 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-gray-900 leading-snug">
            Borrowing <span className="text-accent-600">{sourceName}</span>?
          </h3>
        </div>
        <span className="badge bg-accent-50 text-accent-700 font-semibold text-xs">
          {confidencePercent}% match
        </span>
      </div>

      {/* Related Items */}
      <div className="flex-1 space-y-3 mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          You might also need:
        </p>
        {relatedItems.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            No related items found.
          </p>
        ) : (
          relatedItems.slice(0, 4).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img
                src={getItemImage(item)}
                alt={item.name}
                className="h-10 w-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 flex-shrink-0"
                style={{ display: "none" }}
              >
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Reason */}
      <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-medium text-gray-700">Based on: </span>
          {recommendation.reason}
        </p>
      </div>

      {/* Actions */}
      <button
        onClick={handleAddAll}
        className="btn btn-accent w-full"
        disabled={relatedItems.length === 0}
      >
        <ShoppingCart className="h-4 w-4" />
        Add all to borrow list
        <ArrowRight className="h-4 w-4 ml-auto" />
      </button>
    </motion.div>
  );
}

// ---- Course Filter ----
function CourseFilter({ courses, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = selected === "all" ? "All Courses" : selected;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline justify-between min-w-[200px]"
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {selectedLabel}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden"
          >
            {courses.map((course) => (
              <button
                key={course}
                onClick={() => {
                  onChange(course);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm transition-colors min-h-[44px] hover:bg-gray-50",
                  selected === course
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-700",
                )}
              >
                {course === "all" ? "All Courses" : course}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Frequently Borrowed Together Group ----
function FBTGroup({ group, items, onAddAll, index }) {
  const groupItems = group.items
    .map((gi) => items.find((i) => i.id === gi.id))
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent-600" />
            <h4 className="font-semibold text-gray-900">{group.groupName}</h4>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {group.borrowCount} borrows &middot; {group.course}
          </p>
        </div>
        <button
          onClick={() => onAddAll(group)}
          className="btn btn-accent text-xs min-h-0 py-1.5 px-3"
        >
          <Plus className="h-3 w-3" />
          Borrow Set
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {groupItems.map((item, idx) => (
          <React.Fragment key={item.id}>
            {idx > 0 && (
              <ArrowRight className="h-3 w-3 text-gray-300 flex-shrink-0" />
            )}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
              <img
                src={item.image}
                alt={item.name}
                className="h-6 w-6 rounded object-cover bg-gray-200"
                loading="lazy"
              />
              <span className="text-xs font-medium text-gray-700">
                {truncate(item.name, 20)}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Main Component ----
export default function Recommendations() {
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const itemMap = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, []);

  const getItemName = (id) => itemMap[id]?.name || id;
  const getItemImage = (item) =>
    item?.image ||
    `https://picsum.photos/seed/${item?.id || "default"}/100/100`;

  // Extract unique courses from recommendations basedOn field
  const courses = useMemo(() => {
    const courseSet = new Set(["all"]);
    recommendations.forEach((rec) => {
      const match = rec.basedOn?.match(
        /([A-Z]{2,4}\s?\d{2,4}(?:\/[A-Z]{2,4}\s?\d{2,4})*)/g,
      );
      if (match) {
        match.forEach((c) => courseSet.add(c));
      }
    });
    // Add some default courses for filtering UX
    const extras = ["ECE 201", "ECE 351", "ECE 440", "ECE 211"];
    extras.forEach((c) => courseSet.add(c));
    return Array.from(courseSet);
  }, []);

  const filteredRecommendations = useMemo(() => {
    if (selectedCourse === "all") return recommendations;
    return recommendations.filter((rec) =>
      rec.basedOn?.includes(selectedCourse),
    );
  }, [selectedCourse]);

  // Frequently borrowed together (built from patterns in recommendations)
  const frequentlyBorrowedTogether = useMemo(() => {
    const groups = [];
    const seen = new Set();

    recommendations.forEach((rec) => {
      const sourceItem = itemMap[rec.itemId];
      if (!sourceItem || seen.has(rec.itemId)) return;
      const relatedItems = rec.relatedItemIds
        .map((id) => itemMap[id])
        .filter(Boolean);

      if (relatedItems.length >= 2) {
        seen.add(rec.itemId);
        const courseMatch = rec.basedOn?.match(
          /([A-Z]{2,4}\s?\d{2,4}(?:\/[A-Z]{2,4}\s?\d{2,4})*)/,
        );
        groups.push({
          id: rec.id,
          groupName: `${sourceItem.name} Bundle`,
          borrowCount:
            sourceItem.borrowCount || Math.floor(rec.confidence * 50),
          course: courseMatch ? courseMatch[0] : "General",
          items: [
            { id: sourceItem.id, name: sourceItem.name },
            ...relatedItems.map((ri) => ({ id: ri.id, name: ri.name })),
          ],
        });
      }
    });
    return groups.slice(0, 6);
  }, [itemMap]);

  const handleAddAll = (rec) => {
    const sourceName = getItemName(rec.itemId);
    const relatedCount = rec.relatedItemIds?.length || 0;
    toast.success(
      `Added ${sourceName} and ${relatedCount} related items to borrow list`,
      {
        description: `${relatedCount + 1} items will be available for checkout`,
        duration: 3000,
      },
    );
  };

  const handleAddSet = (group) => {
    toast.success(`Added "${group.groupName}" set to borrow list`, {
      description: `${group.items.length} items ready for checkout`,
      duration: 3000,
    });
  };

  // Loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="page-container space-y-6">
          <div className="page-header">
            <div className="space-y-2">
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-11 w-48 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Smart Recommendations
              </h1>
            </div>
            <p className="text-sm text-gray-500 max-w-2xl">
              Based on borrowing patterns and course requirements. We analyze
              checkout data to suggest complementary equipment you might need.
            </p>
          </div>
          <CourseFilter
            courses={courses}
            selected={selectedCourse}
            onChange={setSelectedCourse}
          />
        </div>

        {/* Recommendations Grid */}
        {filteredRecommendations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Sparkles className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No recommendations found
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {selectedCourse === "all"
                ? "No recommendations available for the current data."
                : `No recommendations found for ${selectedCourse}. Try selecting "All Courses".`}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                itemMap={itemMap}
                getItemName={getItemName}
                getItemImage={getItemImage}
                onAddAll={handleAddAll}
              />
            ))}
          </div>
        )}

        {/* Frequently Borrowed Together */}
        {frequentlyBorrowedTogether.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Frequently Borrowed Together
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frequentlyBorrowedTogether.map((group, idx) => (
                <FBTGroup
                  key={group.id}
                  group={group}
                  items={items}
                  onAddAll={handleAddSet}
                  index={idx}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
