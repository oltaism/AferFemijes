"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Droplet,
  HeartPulse,
  Phone,
  ShieldCheck,
  Stethoscope,
  Syringe,
  User,
} from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import { Child } from "@/lib/types";
import { ageLabel, formatDate } from "@/lib/utils";
import { vaccinesFor, findProvider } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Premium Emergency QR Health Card. Designed to look like a real medical
 * emergency card a parent can show to a first responder. The QR opens a
 * minimal emergency profile — identity, allergies, conditions, vaccine
 * summary, contact — never the full medical record.
 */
export function EmergencyCard({ child }: { child: Child }) {
  const [showBack, setShowBack] = useState(false);
  const vx = vaccinesFor(child.id);
  const completed = vx.filter((v) => v.status === "completed").length;
  const provider = findProvider(child.pediatricianId);

  // Derive deterministic "blood type" from child id so demo always shows one.
  const bloodType = useMemo(() => {
    const types = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    let h = 0;
    for (const ch of child.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return types[h % types.length];
  }, [child.id]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Karta emergjente QR
        </h3>
        <button
          type="button"
          onClick={() => setShowBack((v) => !v)}
          className="text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          {showBack ? "Shfaq pjesën e parme" : "Shfaq pjesën e prapme"}
        </button>
      </div>

      <div className="relative" style={{ perspective: 1200 }}>
        <div
          className={cn(
            "relative w-full min-h-[28rem] transition-transform duration-700 sm:min-h-[26rem]",
            "[transform-style:preserve-3d]",
          )}
          style={{
            transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT */}
          <CardFace>
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 pb-5 text-white shadow-soft">
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-rose-500/20 blur-3xl"
              />
              <div
                aria-hidden
                className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-sky-500/20 blur-3xl"
              />
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 ring-1 ring-inset ring-rose-400/40">
                    <HeartPulse className="h-4 w-4 text-rose-300" aria-hidden />
                  </span>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-200/90">
                      Emergjencë
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      Karta e shëndetit të fëmijës
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/80 ring-1 ring-inset ring-white/20">
                  {APP_NAME}
                </span>
              </div>

              <div className="relative mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/60">
                    Emri
                  </div>
                  <div className="mt-0.5 text-xl font-semibold">{child.fullName}</div>
                  <div className="mt-0.5 text-xs text-white/70">
                    {ageLabel(child.dateOfBirth)} · D.L. {formatDate(child.dateOfBirth)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wide text-white/60">
                    Grupi i gjakut
                  </div>
                  <div className="mt-0.5 flex items-center justify-end gap-1 text-xl font-semibold">
                    <Droplet className="h-4 w-4 text-rose-400" aria-hidden />
                    {bloodType}
                  </div>
                </div>
              </div>

              <div className="relative mt-4 grid grid-cols-2 gap-2.5 text-xs sm:gap-3">
                <Field
                  label="Alergjitë"
                  value={
                    child.allergies.length
                      ? child.allergies.join(", ")
                      : "Asnjë e regjistruar"
                  }
                  tone={child.allergies.length ? "bad" : "ok"}
                />
                <Field
                  label="Sëmundjet"
                  value={
                    child.chronicConditions.length
                      ? child.chronicConditions.join(", ")
                      : "Asnjë"
                  }
                  tone={child.chronicConditions.length ? "warn" : "ok"}
                />
                <Field
                  label="Kontakti i emergjencës"
                  value={
                    child.emergencyContact.name
                      ? `${child.emergencyContact.name} · ${child.emergencyContact.phone}`
                      : "Mungon"
                  }
                  tone={child.emergencyContact.name ? "ok" : "bad"}
                />
                <Field
                  label="Pediatri"
                  value={
                    provider ? `${provider.name} · ${provider.healthCenter}` : "—"
                  }
                />
              </div>

            </div>
          </CardFace>

          {/* BACK */}
          <CardFace flipped>
            <div className="relative min-h-[28rem] rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-soft sm:min-h-[26rem]">
              <div className="flex items-start justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Skano në emergjencë
                </div>
                <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">
                  <ShieldCheck className="h-3 w-3" /> E verifikuar
                </span>
              </div>
              <div className="mt-3 flex gap-4">
                <PseudoQR
                  seed={`ncm:${child.id}:${child.fullName}`}
                  size={132}
                />
                <div className="flex-1 space-y-2 text-xs text-slate-700">
                  <BackRow
                    icon={User}
                    label="Pacienti"
                    value={`${child.fullName} · ${ageLabel(child.dateOfBirth)}`}
                  />
                  <BackRow
                    icon={Droplet}
                    label="Gjaku"
                    value={bloodType}
                  />
                  <BackRow
                    icon={Phone}
                    label="Emergjencë"
                    value={
                      child.emergencyContact.phone || "Pa të dhëna"
                    }
                    tone={child.emergencyContact.phone ? "ok" : "bad"}
                  />
                  <BackRow
                    icon={Stethoscope}
                    label="Pediatri"
                    value={provider?.name ?? "—"}
                  />
                  <BackRow
                    icon={Syringe}
                    label="Vaksinat e kryera"
                    value={`${completed} në dosje`}
                  />
                  <BackRow
                    icon={AlertCircle}
                    label="Alergjitë"
                    value={
                      child.allergies.length
                        ? child.allergies.join(", ")
                        : "Asnjë"
                    }
                    tone={child.allergies.length ? "bad" : "ok"}
                  />
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-snug text-slate-500">
                Skanimi i kësaj karte shfaq vetëm fushat e nevojshme për
                emergjencën. Dosja e plotë mjekësore kërkon pëlqimin eksplicit
                të prindit.
              </p>
            </div>
          </CardFace>
        </div>
      </div>
    </div>
  );
}

function CardFace({
  children,
  flipped,
}: {
  children: React.ReactNode;
  flipped?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 [backface-visibility:hidden]",
        flipped && "[transform:rotateY(180deg)]",
      )}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad";
}) {
  const toneColor =
    tone === "bad"
      ? "text-rose-300"
      : tone === "warn"
        ? "text-amber-300"
        : "text-white";
  return (
    <div className="min-h-[3.25rem] rounded-lg bg-white/5 px-2.5 py-2 ring-1 ring-inset ring-white/10">
      <div className="text-[10px] uppercase tracking-wide text-white/55">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-xs font-medium leading-snug break-words",
          toneColor,
        )}
      >
        {value}
      </div>
    </div>
  );
}

function BackRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof User;
  label: string;
  value: string;
  tone?: "ok" | "bad";
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        className={cn(
          "mt-0.5 h-3.5 w-3.5",
          tone === "bad" ? "text-rose-600" : "text-slate-400",
        )}
        aria-hidden
      />
      <div>
        <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div
          className={cn(
            "text-xs font-medium leading-snug break-words",
            tone === "bad" ? "text-rose-700" : "text-slate-800",
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/** Lightweight deterministic "QR-like" tile (reused from the old QrCard). */
function PseudoQR({ seed, size = 132 }: { seed: string; size?: number }) {
  const cells = 17;
  const cellSize = size / cells;
  const matrix = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h = (h ^ seed.charCodeAt(i)) >>> 0;
      h = (h * 16777619) >>> 0;
    }
    const m: boolean[][] = [];
    for (let y = 0; y < cells; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < cells; x++) {
        h = (h * 1103515245 + 12345) >>> 0;
        row.push(((h >> 16) & 1) === 1);
      }
      m.push(row);
    }
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < Math.floor(cells / 2); x++) {
        m[y][cells - 1 - x] = m[y][x];
      }
    }
    return m;
  }, [seed, cells]);

  function isFinder(x: number, y: number) {
    const inSquare = (cx: number, cy: number) =>
      x >= cx && x <= cx + 6 && y >= cy && y <= cy + 6;
    return (
      inSquare(0, 0) || inSquare(cells - 7, 0) || inSquare(0, cells - 7)
    );
  }
  function isFinderDot(x: number, y: number) {
    const inDot = (cx: number, cy: number) =>
      x >= cx &&
      x <= cx + 6 &&
      y >= cy &&
      y <= cy + 6 &&
      !(x === cx || x === cx + 6 || y === cy || y === cy + 6) &&
      !(x > cx + 1 && x < cx + 5 && y > cy + 1 && y < cy + 5);
    return inDot(0, 0) || inDot(cells - 7, 0) || inDot(0, cells - 7);
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      className="shrink-0 rounded-lg bg-white ring-1 ring-slate-200"
    >
      <rect width={size} height={size} fill="white" />
      {matrix.map((row, y) =>
        row.map((on, x) => {
          const finder = isFinder(x, y);
          const fill =
            finder && !isFinderDot(x, y)
              ? "#0f172a"
              : on
                ? "#0f172a"
                : "transparent";
          return (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={fill}
            />
          );
        }),
      )}
    </svg>
  );
}
