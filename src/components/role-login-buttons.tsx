import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  Stethoscope,
  Syringe,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RoleButton = {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  gradient: string;
  ring: string;
  shadow: string;
  iconWrap: string;
};

const BUTTONS: RoleButton[] = [
  {
    href: "/login?role=parent&step=auth",
    label: "Hyr si prind",
    hint: "Fëmijët · vaksina · kujtesa",
    icon: Users,
    gradient: "from-[#0056D2] via-[#0066f5] to-[#0046b0]",
    ring: "ring-blue-400/40",
    shadow: "shadow-blue-500/30",
    iconWrap: "bg-white/20 text-white",
  },
  {
    href: "/login?role=pediatrician&step=auth",
    label: "Hyr si mjek",
    hint: "Pediatër · kontrolle · vaksina",
    icon: Stethoscope,
    gradient: "from-emerald-600 via-emerald-500 to-teal-700",
    ring: "ring-emerald-400/40",
    shadow: "shadow-emerald-500/30",
    iconWrap: "bg-white/20 text-white",
  },
  {
    href: "/login?role=nurse&step=auth",
    label: "Hyr si infermier(e)",
    hint: "Vaksina · vizita · kujdes ditor",
    icon: Syringe,
    gradient: "from-amber-500 via-orange-500 to-amber-700",
    ring: "ring-amber-400/40",
    shadow: "shadow-amber-500/30",
    iconWrap: "bg-white/20 text-white",
  },
  {
    href: "/public-health",
    label: "Shëndeti publik",
    hint: "Mbulim · fushata · raporte (pa hyrje)",
    icon: Building2,
    gradient: "from-violet-600 via-purple-600 to-indigo-800",
    ring: "ring-violet-400/40",
    shadow: "shadow-violet-500/30",
    iconWrap: "bg-white/20 text-white",
  },
];

export function RoleLoginButtons() {
  return (
    <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {BUTTONS.map((b) => {
        const Icon = b.icon;
        return (
          <Link
            key={b.href}
            href={b.href}
            className={cn(
              "group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white",
              "ring-2 ring-inset transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0",
              b.gradient,
              b.ring,
              b.shadow,
              "shadow-lg",
            )}
          >
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm transition-transform group-hover:scale-110",
                b.iconWrap,
              )}
              aria-hidden
            >
              <Icon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-bold leading-tight sm:text-base">
                {b.label}
              </span>
              <span className="mt-0.5 block text-xs font-medium text-white/85">
                {b.hint}
              </span>
            </span>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-opacity group-hover:bg-white/15"
              aria-hidden
            />
          </Link>
        );
      })}
    </div>
  );
}
