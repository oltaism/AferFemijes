"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { homePathForRole, loginPathForPath } from "@/lib/roles";
import { useIsAuthenticated, useSession } from "@/lib/store";
import { Role } from "@/lib/types";

export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const hydrated = useSession((s) => s._hasHydrated);
  const role = useSession((s) => s.role);
  const authenticated = useIsAuthenticated();

  const wrongRole = Boolean(role && authenticated && !allow.includes(role));

  useEffect(() => {
    if (!hydrated) return;
    if (!authenticated) {
      router.replace(loginPathForPath(pathname));
      return;
    }
    if (role && !allow.includes(role)) {
      router.replace(homePathForRole(role));
    }
  }, [hydrated, authenticated, role, allow, router, pathname]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="card p-8 text-center text-sm text-slate-600">
          Po ngarkohet…
        </div>
      </div>
    );
  }

  if (!authenticated || !role || !allow.includes(role)) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="card p-8 text-center text-sm text-slate-600">
          {wrongRole
            ? "Po ridrejtohet te paneli juaj…"
            : "Po ridrejtohet te hyrja…"}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
