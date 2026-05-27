import { ChevronRight, MapPin } from "lucide-react";

export default function LocationBreadcrumb({ location }) {
  if (!location) return null;

  const parts = [
    location.building,
    location.floor,
    location.room,
    location.cabinet,
    location.drawer,
  ].filter(Boolean);

  return (
    <div className="flex items-center flex-wrap gap-y-1">
      <MapPin size={14} className="text-lab-mauve flex-shrink-0 mr-1" />
      {parts.map((part, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <span className="text-sm text-gray-600 bg-lab-cream px-2 py-0.5 rounded-md font-medium">
            {part}
          </span>
          {idx < parts.length - 1 && (
            <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
          )}
        </span>
      ))}
    </div>
  );
}
