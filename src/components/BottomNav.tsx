"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, UtensilsCrossed, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/nearby", icon: MapPin, label: "주변" },
  { href: "/restaurants", icon: UtensilsCrossed, label: "맛집" },
  { href: "/attractions", icon: Landmark, label: "명소" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white/90 dark:bg-[#1E1810]/90 backdrop-blur-lg border-t border-[#E8DDD0] dark:border-[#3A2E24] bottom-nav-safe">
      <ul className="flex items-center justify-around py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200",
                  active
                    ? "text-[#C60B1E]"
                    : "text-[#8A7A6A] dark:text-[#8A7A6A] hover:text-[#C60B1E]"
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={cn(active && "drop-shadow-sm")}
                />
                <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
