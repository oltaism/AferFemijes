"use client";

import { useSession } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SimpleModeWrapper({ children }: { children: React.ReactNode }) {
  const simpleMode = useSession((s) => s.simpleMode);
  return <div className={cn(simpleMode && "simple-mode")}>{children}</div>;
}
