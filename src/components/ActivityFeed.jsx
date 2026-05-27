import StatusBadge from "./StatusBadge";

const ACTION_ICON = {
  Borrowed: "⬇",
  Returned: "↩",
  Reported: "⚠",
  Restocked: "📦",
};

const ACTION_COLOR = {
  Borrowed: "text-lab-amber",
  Returned: "text-lab-sage",
  Reported: "text-red-500",
  Restocked: "text-blue-500",
};

const ACTION_BG = {
  Borrowed: "bg-lab-amber/10",
  Returned: "bg-lab-sage/10",
  Reported: "bg-red-50",
  Restocked: "bg-blue-50",
};

export default function ActivityFeed({ transactions = [], limit = 5 }) {
  const displayed = transactions.slice(0, limit);

  if (displayed.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No recent activity
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {displayed.map((tx) => (
        <div key={tx.id} className="flex items-start gap-3">
          {/* Action icon */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${
              ACTION_BG[tx.action] ?? "bg-lab-cream"
            }`}
          >
            {ACTION_ICON[tx.action] ?? "•"}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 leading-snug">
              <span className="font-semibold">{tx.userName}</span>{" "}
              <span
                className={`font-medium ${ACTION_COLOR[tx.action] ?? "text-gray-500"}`}
              >
                {tx.action.toLowerCase()}
              </span>{" "}
              <span className="font-medium text-gray-800">{tx.itemName}</span>
              {tx.quantity > 0 && (
                <span className="text-gray-400"> ×{tx.quantity}</span>
              )}
            </p>
            {tx.purpose && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {tx.purpose}
              </p>
            )}
            <p className="text-xs text-gray-300 mt-0.5">{tx.date}</p>
          </div>

          {/* Condition badge (returned items) */}
          {tx.condition && (
            <div className="flex-shrink-0 mt-0.5">
              <StatusBadge status={tx.condition} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
