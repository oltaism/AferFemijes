"use client";

import { useEffect, useRef } from "react";
import { fetchMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useSession } from "@/lib/store";

/** Pas ngarkimit, verifikon token-in me API dhe pastron sesionin nëse është i pavlefshëm. */
export function SessionValidator() {
  const hydrated = useSession((s) => s._hasHydrated);
  const accessToken = useSession((s) => s.accessToken);
  const signOut = useSession((s) => s.signOut);
  const checked = useRef(false);

  useEffect(() => {
    if (!hydrated || checked.current) return;
    if (!accessToken) return;
    checked.current = true;

    fetchMe(accessToken).catch((err) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        signOut();
      }
    });
  }, [hydrated, accessToken, signOut]);

  return null;
}
