"use client";

import { useEffect } from "react";

/** Pastron SW/cache të vjetër që shkakton faqe pa Tailwind CSS. */
async function clearStalePwaCaches() {
  if (typeof window === "undefined") return;

  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
}

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    void (async () => {
      await clearStalePwaCaches();

      if (process.env.NODE_ENV !== "production") return;

      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // PWA opsionale — aplikacioni funksionon pa SW.
      }
    })();
  }, []);

  return null;
}
