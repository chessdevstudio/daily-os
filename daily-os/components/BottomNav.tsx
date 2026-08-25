"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Aujourd'hui", icon: HomeIcon },
  { href: "/nutrition", label: "Nutrition", icon: BowlIcon },
  { href: "/focus", label: "Focus", icon: CheckIcon },
  { href: "/habits", label: "Habitudes", icon: GridIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-line z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation principale"
    >
      <div className="max-w-md mx-auto grid grid-cols-4">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 py-2.5"
              aria-current={active ? "page" : undefined}
            >
              <Icon active={!!active} />
              <span className={`text-[11px] ${active ? "font-semibold text-ink" : "text-mute"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#0A0A0A" : "#8A8A85"} strokeWidth="1.8">
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BowlIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#0A0A0A" : "#8A8A85"} strokeWidth="1.8">
      <path d="M4 12h16a8 6 0 0 1-16 0Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12V6M12 12V4M15 12V6" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#0A0A0A" : "#8A8A85"} strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8.5 12.5l2.2 2.2L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#0A0A0A" : "#8A8A85"} strokeWidth="1.8">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}
