"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BarChart3,
  Brain,
  CalendarCheck,
  FileText,
  Home,
  MessageCircle,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";
import { useIsAuthenticated, useSession } from "@/lib/store";
import { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  label: string;
  icon: typeof Home;
};

const TABS_BY_ROLE: Record<Role, Tab[]> = {
  parent: [
    { href: "/parent", label: "Kreu", icon: Home },
    { href: "/parent/appointments", label: "Takime", icon: CalendarCheck },
    { href: "/parent/risk", label: "AI Rrezik", icon: Brain },
    { href: "/parent/messages", label: "Bisedat", icon: MessageCircle },
    { href: "/parent/settings", label: "Cilësime", icon: Settings },
  ],
  pediatrician: [
    { href: "/provider", label: "Fëmijët", icon: Users },
    { href: "/provider/messages", label: "Bisedat", icon: MessageCircle },
    { href: "/provider/settings", label: "Cilësime", icon: Settings },
  ],
  nurse: [
    { href: "/provider", label: "Fëmijët", icon: Users },
    { href: "/provider/messages", label: "Bisedat", icon: MessageCircle },
    { href: "/provider/settings", label: "Cilësime", icon: Settings },
  ],
  "public-health": [
    { href: "/public-health", label: "Përmbledhje", icon: BarChart3 },
    { href: "/public-health/campaigns", label: "Fushatat", icon: Bell },
    { href: "/public-health/settings", label: "Cilësime", icon: Settings },
  ],
};

const LANDING_TABS: Tab[] = [
  { href: "/", label: "Kreu", icon: Home },
  { href: "/login?role=parent&step=auth", label: "Prind", icon: Users },
  { href: "/login?role=pediatrician&step=auth", label: "Mjek", icon: Stethoscope },
  { href: "/login?role=nurse&step=auth", label: "Inferm.", icon: Stethoscope },
  { href: "/public-health", label: "Publik", icon: BarChart3 },
];

const SECONDARY_BY_ROLE: Record<Role, Tab[]> = {
  parent: [
    { href: "/parent/documents", label: "Dokumente", icon: FileText },
  ],
  pediatrician: [],
  nurse: [],
  "public-health": [],
};

export function MobileTabBar() {
  const pathname = usePathname() ?? "/";
  const role = useSession((s) => s.role);
  const authenticated = useIsAuthenticated();

  if (pathname === "/login" || pathname.startsWith("/login")) {
    return null;
  }

  const isPublicHealthArea = pathname.startsWith("/public-health");
  const isPublicView =
    pathname === "/" || (!authenticated && !isPublicHealthArea);
  const tabs =
    isPublicHealthArea && (!role || role === "public-health")
      ? TABS_BY_ROLE["public-health"]
      : isPublicView || !role
        ? LANDING_TABS
        : TABS_BY_ROLE[role];
  const secondary =
    isPublicView || !role ? [] : SECONDARY_BY_ROLE[role] ?? [];
  const allTabs = [...tabs, ...secondary];

  return (
    <nav
      aria-label="Navigimi kryesor — mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul
        className="mx-auto grid max-w-md"
        style={{
          gridTemplateColumns: `repeat(${allTabs.length}, minmax(0, 1fr))`,
        }}
      >
        {allTabs.map((t) => {
          const active =
            pathname === t.href ||
            (t.href !== "/" && pathname.startsWith(t.href));
          const Icon = t.icon;
          return (
            <li key={t.href} className="flex">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-brand-700"
                    : "text-slate-500 active:bg-slate-100",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-brand-50",
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", active && "text-brand-700")}
                    aria-hidden
                  />
                </span>
                <span className="leading-none">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
