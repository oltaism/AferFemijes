"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  BarChart3,
  HeartPulse,
  Stethoscope,
  Syringe,
  Users,
} from "lucide-react";
import { AuthPanel } from "@/components/auth-panel";
import { APP_NAME } from "@/lib/brand";
import type { AuthUser } from "@/lib/api/auth";
import { homePathForRole } from "@/lib/roles";
import { useIsAuthenticated, useSession } from "@/lib/store";
import { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES: {
  role: Role;
  title: string;
  description: string;
  icon: typeof Users;
  redirect: string;
  accent: string;
}[] = [
  {
    role: "parent",
    title: "Prind",
    description: "Fëmijë · vaksina · kujtesa · mesazhe.",
    icon: Users,
    redirect: "/parent",
    accent: "from-sky-500 to-blue-600",
  },
  {
    role: "pediatrician",
    title: "Pediatër",
    description: "Profile · vaksina · prindër · fëmijë të caktuar.",
    icon: Stethoscope,
    redirect: "/provider",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    role: "nurse",
    title: "Infermier(e)",
    description: "Vaksina · kontrolle · kujtesa · vizita.",
    icon: Syringe,
    redirect: "/provider",
    accent: "from-amber-500 to-orange-600",
  },
  {
    role: "public-health",
    title: "Shëndeti publik",
    description: "Mbulim anonim · vonesa · fushata.",
    icon: BarChart3,
    redirect: "/public-health",
    accent: "from-violet-500 to-purple-600",
  },
];

type Step = "role" | "auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <div className="card h-[420px] animate-pulse bg-white" />
    </div>
  );
}

function roleLabel(role: Role): string {
  switch (role) {
    case "parent":
      return "prind";
    case "pediatrician":
      return "pediatër";
    case "nurse":
      return "infermier(e)";
    case "public-health":
      return "shëndeti publik";
  }
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useSession((s) => s.setAuth);
  const sessionRole = useSession((s) => s.role);
  const authenticated = useIsAuthenticated();
  const hydrated = useSession((s) => s._hasHydrated);
  const [step, setStep] = useState<Step>("role");
  const [selected, setSelected] = useState<Role | null>(null);

  useEffect(() => {
    if (!hydrated || !authenticated || !sessionRole) return;
    router.replace(homePathForRole(sessionRole));
  }, [hydrated, authenticated, sessionRole, router]);

  useEffect(() => {
    const prefilled = params.get("role") as Role | null;
    if (prefilled && ROLES.find((r) => r.role === prefilled)) {
      setSelected(prefilled);
    }
    if (params.get("step") === "auth" && prefilled) {
      setStep("auth");
    }
  }, [params]);

  const selectedMeta = ROLES.find((r) => r.role === selected);

  function goToAuth() {
    if (!selected) return;
    setStep("auth");
  }

  function onAuthSuccess(accessToken: string, user: AuthUser) {
    setAuth({ accessToken, user });
    router.replace(homePathForRole(user.role));
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <div className="card overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[1fr_1.4fr]">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-10">
            <span className="chip bg-white/10 text-white ring-white/20">
              <HeartPulse className="h-3.5 w-3.5" />
              {step === "role" ? "Hyrje" : "Llogaria"}
            </span>
            <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">
              {step === "role"
                ? "Zgjidh rolin"
                : selected === "parent"
                  ? "Hyr ose regjistrohu"
                  : "Hyr në llogari"}
            </h1>
            <p className="mt-3 text-white/85">
              {step === "role"
                ? `Zgjidhni si doni të përdorni ${APP_NAME}, pastaj vazhdoni te hyrja.`
                : selected === "parent"
                  ? "Përdorni llogarinë ekzistuese ose krijoni një të re për familjen tuaj."
                  : "Përdorni kredencialet e dhëna nga klinika ose shërbimi zyrtar."}
            </p>
            {step === "auth" && selectedMeta ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                    selectedMeta.accent,
                  )}
                  aria-hidden
                >
                  <selectedMeta.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{selectedMeta.title}</div>
                  <div className="text-sm text-white/80">
                    {selectedMeta.description}
                  </div>
                </div>
              </div>
            ) : (
              <ul className="mt-6 space-y-2 text-sm text-white/85">
                <li>• Prindi — regjistrim i hapur</li>
                <li>• Mjeku / infermieri — hyrje me llogari</li>
                <li>• Shëndeti publik — të dhëna të grumbulluara</li>
              </ul>
            )}
          </div>

          <div className="p-6 sm:p-10">
            {step === "role" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelected(r.role)}
                      aria-pressed={selected === r.role}
                      className={cn(
                        "group flex flex-col items-start gap-2 rounded-2xl border bg-white p-4 text-left transition-all",
                        selected === r.role
                          ? "border-brand-500 ring-2 ring-brand-200"
                          : "border-slate-200 hover:border-slate-300",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                          r.accent,
                        )}
                        aria-hidden
                      >
                        <r.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {r.title}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {r.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    ← Kthehu te kreu
                  </Link>
                  <button
                    type="button"
                    disabled={!selected}
                    onClick={goToAuth}
                    className="btn-primary"
                  >
                    {selected
                      ? `Vazhdo si ${roleLabel(selected)}`
                      : "Zgjidh një rol"}
                  </button>
                </div>
              </>
            ) : selected ? (
              <AuthPanel
                role={selected}
                onSuccess={onAuthSuccess}
                onBack={() => setStep("role")}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
