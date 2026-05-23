"use client";

import { useEffect, useState } from "react";
import { Download, Share2, Smartphone, X } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "ncm-install-dismissed";

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.localStorage.getItem(DISMISS_KEY) === "1") {
      return;
    }

    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    if (standalone) {
      setInstalled(true);
      return;
    }

    if (iOS) {
      setIsIos(true);
      const t = window.setTimeout(() => setOpen(true), 1200);
      return () => window.clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setOpen(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setOpen(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setOpen(false);
  }

  if (installed || !open) return null;

  return (
    <div
      role="dialog"
      aria-label={`Instalo ${APP_NAME}`}
      className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom,0px))] z-50 px-4 md:bottom-6"
    >
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200">
            <Smartphone className="h-5 w-5" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Instalo në telefon
            </p>
            {isIos ? (
              <p className="mt-1 text-xs text-slate-600">
                Safari →{" "}
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 align-baseline text-[11px] font-medium">
                  <Share2 className="h-3 w-3" aria-hidden /> Ndaj
                </span>{" "}
                →{" "}
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium">
                  Shto në ekranin kryesor
                </span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-600">
                Një prekje për kujtesa dhe alarme · funksionon offline.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              {!isIos && deferredPrompt && (
                <button
                  type="button"
                  onClick={install}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Instalo
                </button>
              )}
              <button
                type="button"
                onClick={dismiss}
                className="btn-ghost px-3 py-1.5 text-xs"
              >
                Jo tani
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            aria-label="Mbyll lajmërimin për instalim"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
