import StatusBadge from "./StatusBadge";

export default function ItemCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="card cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 select-none"
    >
      {/* Emoji image */}
      <div className="w-14 h-14 bg-lab-cream rounded-2xl flex items-center justify-center text-3xl mx-auto flex-shrink-0">
        {item.image}
      </div>

      {/* Name + category */}
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
          {item.name}
        </p>
        <p className="text-xs text-gray-400 mt-1">{item.category}</p>
      </div>

      {/* Footer: qty + status */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-lab-slate/10">
        <span className="text-xs text-gray-500">
          <span className="font-semibold text-gray-700">
            {item.quantity.available}
          </span>
          /{item.quantity.total}
        </span>
        <StatusBadge status={item.status} />
      </div>
    </div>
  );
}
