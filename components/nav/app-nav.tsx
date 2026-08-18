"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/today", label: "Today", icon: TodayMark },
  { href: "/tomorrow", label: "Tomorrow", icon: TomorrowMark },
  { href: "/registry", label: "Registry", icon: RegistryMark },
  { href: "/stats", label: "Stats", icon: StatsMark },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav" aria-label="Main">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              active ? "app-nav__item app-nav__item--active" : "app-nav__item"
            }
            aria-current={active ? "page" : undefined}
          >
            <Icon />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function TodayMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="app-nav__icon">
      <rect x="4" y="5" width="16" height="14" rx="4" />
      <rect x="7" y="9" width="4" height="4" rx="1.5" />
      <rect x="13" y="9" width="4" height="4" rx="1.5" />
    </svg>
  );
}

function TomorrowMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="app-nav__icon">
      <path d="M7.5 5.8c0-.9 1-1.4 1.7-.9l9 5.2c.7.4.7 1.4 0 1.8l-9 5.2c-.7.4-1.7-.1-1.7-.9V5.8Z" />
    </svg>
  );
}

function RegistryMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="app-nav__icon">
      <rect x="5" y="4" width="14" height="5" rx="2.5" />
      <rect x="5" y="10.5" width="14" height="5" rx="2.5" />
      <rect x="5" y="17" width="14" height="4" rx="2" />
    </svg>
  );
}

function StatsMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="app-nav__icon">
      <rect x="4" y="13" width="4" height="7" rx="2" />
      <rect x="10" y="8" width="4" height="12" rx="2" />
      <rect x="16" y="4" width="4" height="16" rx="2" />
    </svg>
  );
}
