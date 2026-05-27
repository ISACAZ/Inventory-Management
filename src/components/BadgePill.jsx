const RARITY_STYLES = {
  common: "bg-gray-100 text-gray-600 border border-gray-200",
  rare: "bg-blue-50 text-blue-700 border border-blue-100",
  epic: "bg-purple-50 text-purple-700 border border-purple-100",
  legendary: "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

export default function BadgePill({ badge }) {
  if (!badge) return null;

  const colorClass = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.common;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}
      title={badge.description}
    >
      <span>{badge.icon}</span>
      <span>{badge.name}</span>
    </span>
  );
}
