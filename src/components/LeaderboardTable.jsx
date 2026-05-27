import { Trophy } from "lucide-react";
import BadgePill from "./BadgePill";

const rankMedal = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardTable({ data = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-lab-slate/20 text-left">
            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">
              Rank
            </th>
            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              User
            </th>
            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
              Department
            </th>
            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
              Points
            </th>
            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
              Badges
            </th>
            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell text-right">
              Borrowed
            </th>
            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell text-right">
              On-Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((entry, idx) => {
            const rank = idx + 1;
            const medal = rankMedal[rank];
            const isTop3 = rank <= 3;

            return (
              <tr
                key={entry.userId}
                className={`transition-colors ${isTop3 ? "bg-lab-mauve/3" : "hover:bg-gray-50"}`}
              >
                {/* Rank */}
                <td className="py-3 pr-3">
                  {medal ? (
                    <span className="text-lg leading-none">{medal}</span>
                  ) : (
                    <span className="font-semibold text-gray-400 text-sm">
                      #{rank}
                    </span>
                  )}
                </td>

                {/* User */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: entry.avatarColor ?? "#B294A0",
                      }}
                    >
                      {entry.avatar}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`font-medium truncate ${isTop3 ? "text-gray-800" : "text-gray-700"}`}
                      >
                        {entry.userName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {entry.role}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Department */}
                <td className="py-3 pr-4 text-gray-500 text-xs hidden md:table-cell">
                  {entry.department}
                </td>

                {/* Points */}
                <td className="py-3 pr-4 text-right">
                  <span className="flex items-center justify-end gap-1 font-bold text-gray-800">
                    <Trophy size={13} className="text-lab-amber" />
                    {entry.points.toLocaleString()}
                  </span>
                </td>

                {/* Badges */}
                <td className="py-3 pr-4 hidden lg:table-cell">
                  <div className="flex items-center gap-1 flex-wrap">
                    {entry.badges?.slice(0, 2).map((b) => (
                      <BadgePill key={b.id} badge={b} />
                    ))}
                    {entry.badges?.length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{entry.badges.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* Borrowed */}
                <td className="py-3 pr-4 text-right text-gray-600 hidden lg:table-cell">
                  {entry.stats?.borrowed ?? "—"}
                </td>

                {/* On-time */}
                <td className="py-3 text-right hidden lg:table-cell">
                  {entry.stats?.onTime != null ? (
                    <span className="text-lab-sage font-medium">
                      {entry.stats.onTime}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
