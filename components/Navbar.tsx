'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/partners", label: "Partners" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-emerald-900 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold transition hover:text-emerald-700 sm:text-lg"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-amber-400 text-xs font-semibold uppercase text-white shadow-sm">
            SS
          </span>
          SoraSolar（空ソラー）
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-emerald-800 sm:gap-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "hover:bg-emerald-50 hover:text-emerald-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

