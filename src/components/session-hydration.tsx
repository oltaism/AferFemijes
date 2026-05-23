"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/store";

/** Njofton aplikacionin kur sesioni nga localStorage është gati. */
export function SessionHydration() {
  useEffect(() => {
    const markReady = () => {
      useSession.setState({ _hasHydrated: true });
    };

    if (useSession.persist.hasHydrated()) {
      markReady();
    }

    return useSession.persist.onFinishHydration(markReady);
  }, []);

  return null;
}
