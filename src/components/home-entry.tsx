"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/store";

/** Faqja kryesore është publike — pastron sesionin që të kërkohet hyrja e re. */
export function HomeEntry() {
  const hydrated = useSession((s) => s._hasHydrated);
  const signOut = useSession((s) => s.signOut);

  useEffect(() => {
    if (!hydrated) return;
    signOut();
  }, [hydrated, signOut]);

  return null;
}
