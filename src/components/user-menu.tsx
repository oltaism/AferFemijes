"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Settings,
  UserPen,
} from "lucide-react";
import type { AuthUser } from "@/lib/api/auth";
import {
  homePathForRole,
  roleLabelSq,
  settingsPathForRole,
} from "@/lib/roles";
import { useSession } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function UserMenu({
  role,
  user,
}: {
  role: Role;
  user: AuthUser | null;
}) {
  const router = useRouter();
  const signOut = useSession((s) => s.signOut);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? "P";
  const home = homePathForRole(role);
  const settings = settingsPathForRole(role);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleSignOut() {
    setOpen(false);
    signOut();
    router.push("/");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-1.5 pr-2 transition-colors hover:bg-slate-100",
          open && "border-brand-200 bg-brand-50/60 ring-2 ring-brand-100",
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0056D2] text-xs font-bold text-white">
          {initial}
        </span>
        <span className="hidden max-w-[9rem] truncate text-sm font-semibold text-slate-800 sm:inline">
          {roleLabelSq(role)}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Menyja e llogarisë"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name ?? "Përdorues"}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
            <p className="mt-1 text-xs font-medium text-[#0056D2]">
              {roleLabelSq(role)}
            </p>
          </div>

          <MenuLink
            href={home}
            icon={LayoutGrid}
            label="Paneli im"
            onNavigate={() => setOpen(false)}
          />
          <MenuLink
            href={`${settings}#profili`}
            icon={UserPen}
            label="Ndrysho profilin"
            onNavigate={() => setOpen(false)}
          />
          <MenuLink
            href={settings}
            icon={Settings}
            label="Cilësimet"
            onNavigate={() => setOpen(false)}
          />

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Dil nga llogaria
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: typeof Settings;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      {label}
    </Link>
  );
}
