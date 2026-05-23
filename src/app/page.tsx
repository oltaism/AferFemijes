import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Bell,
  Brain,
  Calendar,
  Shield,
} from "lucide-react";
import { HomeEntry } from "@/components/home-entry";
import { RoleLoginButtons } from "@/components/role-login-buttons";
import { InstallAppPrompt } from "@/components/install-app-prompt";
import {
  APP_NAME,
  APP_TAGLINE,
  HERO_ILLUSTRATION_SRC,
} from "@/lib/brand";

const iconClass = "bg-brand-100 text-[#0056D2]";

const highlights = [
  {
    icon: Calendar,
    title: "Kujtesa për vaksina",
    description: "Njoftime në kohë për çdo vaksinë e fëmijës.",
  },
  {
    icon: Activity,
    title: "Kontrolle periodike",
    description: "Planifikon dhe kujton kontrollet e radhës.",
  },
  {
    icon: Bell,
    title: "Alarm i hershëm",
    description: "Identifikon rrezikun dhe paralajmëron në kohë.",
  },
  {
    icon: Brain,
    title: "Paralajmërim nga AI",
    description: "Ndihmon sot, për të shmangur problemet nesër.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-sky-50/80 via-white to-white">
      <HomeEntry />
      <InstallAppPrompt />

      {/* Hero */}
      <section className="relative overflow-hidden pb-0">
        <div
          className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl"
          aria-hidden
        />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:py-20 lg:gap-16">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
              {APP_NAME}
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
              {APP_TAGLINE}
            </p>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3.5">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <p className="text-sm font-medium text-brand-900">
                Sepse çdo fëmijë meriton një fillim të shëndetshëm.
              </p>
            </div>

            <RoleLoginButtons />
          </div>

          <div className="relative mx-auto flex w-full max-w-lg items-center justify-center px-2 sm:max-w-xl">
            <Image
              src={HERO_ILLUSTRATION_SRC}
              alt={`${APP_NAME} — familja`}
              width={560}
              height={560}
              priority
              unoptimized
              className="h-auto w-full max-w-[320px] object-contain sm:max-w-[380px]"
            />
          </div>
        </div>
      </section>

      {/* 4 kartela — një rresht */}
      <section className="-mt-6 border-t border-slate-100 bg-white/80 pb-16 md:-mt-10">
        <div className="mx-auto grid max-w-7xl grid-cols-4 gap-2 px-4 py-8 sm:gap-3 sm:px-6 md:py-10">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="card min-w-0 p-3 transition-shadow hover:shadow-soft sm:p-4 md:p-5"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 md:h-11 md:w-11 md:rounded-2xl ${iconClass}`}
              >
                <h.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden />
              </div>
              <h2 className="mt-2 text-xs font-semibold leading-snug text-slate-900 sm:mt-3 sm:text-sm md:text-base">
                {h.title}
              </h2>
              <p className="mt-1 text-[11px] leading-snug text-slate-600 sm:mt-1.5 sm:text-xs md:text-sm">
                {h.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
