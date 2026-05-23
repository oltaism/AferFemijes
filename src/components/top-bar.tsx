"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Calendar,
  LayoutGrid,
  LogOut,
  Users,
} from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { UserMenu } from "@/components/user-menu";
import { APP_HEADER_TAGLINE, APP_NAME } from "@/lib/brand";
import { loginPathForRole } from "@/lib/roles";
import { useIsAuthenticated, useSession } from "@/lib/store";
import { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const PARENT_NAV = [
  { href: "/parent", label: "Paneli", icon: LayoutGrid, exact: true },
  { href: "/parent#femijet", label: "Fëmijët", icon: Users, exact: false },
  { href: "/parent#kujtesat", label: "Kujtesat", icon: Bell, exact: false },
  { href: "/parent/appointments", label: "Takimet", icon: Calendar, exact: false },
  { href: "/parent/risk", label: "Raportet", icon: BarChart3, exact: false },
];

const NAV_BY_ROLE: Record<
  string,
  { href: string; label: string; icon: typeof LayoutGrid }[]
> = {
  pediatrician: [
    { href: "/provider", label: "Paneli", icon: LayoutGrid },
    { href: "/provider/messages", label: "Mesazhet", icon: Bell },
    { href: "/provider/settings", label: "Cilësimet", icon: Calendar },
  ],
  nurse: [
    { href: "/provider", label: "Paneli", icon: LayoutGrid },
    { href: "/provider/messages", label: "Mesazhet", icon: Bell },
    { href: "/provider/settings", label: "Cilësimet", icon: Calendar },
  ],
  "public-health": [
    { href: "/public-health", label: "Përmbledhja", icon: LayoutGrid },
    { href: "/public-health/campaigns", label: "Fushatat", icon: Calendar },
    { href: "/public-health/settings", label: "Cilësimet", icon: BarChart3 },
  ],
};

function landingNavForRole(role: Role) {
  const login = loginPathForRole(role);
  if (role === "parent") {
    return [
      { href: login, label: "Paneli", icon: LayoutGrid, exact: true },
      { href: login, label: "Fëmijët", icon: Users, exact: false },
      { href: login, label: "Kujtesat", icon: Bell, exact: false },
      { href: login, label: "Takimet", icon: Calendar, exact: false },
      { href: login, label: "Raportet", icon: BarChart3, exact: false },
    ];
  }
  if (role === "pediatrician" || role === "nurse") {
    return [
      { href: login, label: "Paneli", icon: LayoutGrid, exact: true },
      { href: login, label: "Mesazhet", icon: Bell, exact: false },
      { href: login, label: "Cilësimet", icon: Calendar, exact: false },
    ];
  }
  return [
    { href: login, label: "Përmbledhja", icon: LayoutGrid, exact: true },
    { href: login, label: "Fushatat", icon: Calendar, exact: false },
    { href: login, label: "Cilësimet", icon: BarChart3, exact: false },
  ];
}

const LANDING_NAV_PARENT = landingNavForRole("parent");

function isNavActive(
  pathname: string,
  href: string,
  exact?: boolean,
): boolean {
  if (href.includes("#")) {
    return pathname === "/parent";
  }
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useSession((s) => s.role);
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const authenticated = useIsAuthenticated();

  const isLanding = pathname === "/";
  const isPublicHealthArea = pathname.startsWith("/public-health");
  const isPublicHealthGuest = isPublicHealthArea && !authenticated;
  const isPublicView = isLanding || (!authenticated && !isPublicHealthArea);
  const isParent = role === "parent";
  const parentNav = PARENT_NAV;
  const otherNav = role && !isParent ? NAV_BY_ROLE[role] ?? [] : [];
  const publicHealthNav = NAV_BY_ROLE["public-health"];
  const nav = isPublicHealthGuest || (isPublicHealthArea && role === "public-health")
    ? publicHealthNav
    : isPublicView
      ? LANDING_NAV_PARENT
      : isParent
        ? parentNav
        : role
          ? otherNav
          : [];

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200 bg-white"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`Faqja kryesore — ${APP_NAME}`}
        >
          <AppLogo size={40} className="h-10 w-10 shrink-0" />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-bold text-[#0056D2]">{APP_NAME}</span>
            <span className="text-[10px] text-slate-500">{APP_HEADER_TAGLINE}</span>
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex"
          aria-label="Menyja kryesore"
        >
          {nav.map((n) => {
            const active = isNavActive(
              pathname,
              n.href,
              "exact" in n ? n.exact : false,
            );
            const Icon = n.icon;
            return (
              <Link
                key={`${n.href}-${n.label}`}
                href={n.href}
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-[#0056D2]"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {n.label}
                {active ? (
                  <span
                    className="absolute inset-x-2 -bottom-[1.125rem] h-0.5 rounded-full bg-[#0056D2]"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {authenticated && !isLanding && !isPublicHealthGuest ? (
            <>
              <button
                type="button"
                className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-50"
                aria-label="Njoftime"
              >
                <Bell className="h-5 w-5" aria-hidden />
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  3
                </span>
              </button>
              {role ? <UserMenu role={role} user={user} /> : null}
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 sm:hidden"
                aria-label="Dil"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-[#0056D2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0046b0]"
            >
              Hyr
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
