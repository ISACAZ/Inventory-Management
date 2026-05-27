import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const REASON_CONFIG = {
  history: { label: "🕐 Based on your history", color: "text-lab-mauve" },
  dept: { label: "🏫 Popular in your dept", color: "text-blue-500" },
  bundle: { label: "📦 Often borrowed together", color: "text-lab-amber" },
  project: { label: "🔬 Matches your project", color: "text-lab-sage" },
  trending: { label: "🔥 Trending this week", color: "text-red-500" },
  seasonal: { label: "📅 Seasonal pick", color: "text-purple-500" },
};

export default function RecommendationCard({ recommendation, type }) {
  const navigate = useNavigate();
  const { item, reason, reasonType } = recommendation ?? {};

  if (!item) return null;

  const config = REASON_CONFIG[reasonType] ?? {
    label: "💡 Recommended",
    color: "text-gray-500",
  };

  return (
    <div
      onClick={() => navigate("/inventory/" + item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate("/inventory/" + item.id)}
      className="card cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 select-none"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-12 h-12 bg-lab-cream rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {item.image}
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* Name + category */}
      <div>
        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
          {item.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
      </div>

      {/* Reason type chip */}
      <p className={`text-xs font-semibold ${config.color}`}>{config.label}</p>

      {/* Reason text */}
      {reason && (
        <p className="text-xs text-gray-500 leading-relaxed border-t border-lab-slate/10 pt-2">
          {reason}
        </p>
      )}
    </div>
  );
}
