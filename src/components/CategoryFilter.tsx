"use client";

import { cn } from "@/lib/utils";

export const CATEGORIES = [
  { id: "all", label: "전체", emoji: "🇪🇸" },
  { id: "tapas", label: "타파스", emoji: "🥘" },
  { id: "paella", label: "파에야", emoji: "🍚" },
  { id: "pintxos", label: "핀초스", emoji: "🍢" },
  { id: "churros", label: "츄러스", emoji: "🍩" },
  { id: "jamon", label: "하몬", emoji: "🥩" },
  { id: "seafood", label: "해산물", emoji: "🦑" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

interface Props {
  selected: CategoryId;
  onChange: (id: CategoryId) => void;
}

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none px-4 -mx-4">
      <div className="flex gap-2 px-4">
        {CATEGORIES.map(({ id, label, emoji }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95",
              selected === id
                ? "bg-[#C60B1E] text-white shadow-warm"
                : "bg-[#F5F0E8] dark:bg-[#2A2018] text-[#6B5E4E] dark:text-[#B8A898] hover:bg-[#E8DDD0] dark:hover:bg-[#3A2E24]"
            )}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
