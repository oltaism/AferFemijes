"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { children as mockChildren } from "@/lib/mock-data";
import { PreventiveAIAgent } from "./PreventiveAIAgent";

export function ParentAIFloatingAssistant() {
  const pathname = usePathname();
  const parentChildren = useMemo(
    () => mockChildren.filter((c) => c.parentId === "parent-1"),
    [],
  );

  const childFromPath = pathname.match(/\/parent\/child\/([^/]+)/)?.[1];
  const [selectedId, setSelectedId] = useState(
    () => childFromPath ?? parentChildren[0]?.id ?? "",
  );

  useEffect(() => {
    if (childFromPath) setSelectedId(childFromPath);
  }, [childFromPath]);

  const activeId =
    parentChildren.find((c) => c.id === selectedId)?.id ??
    childFromPath ??
    parentChildren[0]?.id;

  const activeChild = parentChildren.find((c) => c.id === activeId);

  if (!activeChild) return null;

  const options = parentChildren.map((c) => ({
    id: c.id,
    fullName: c.fullName,
  }));

  return (
    <PreventiveAIAgent
      childId={activeChild.id}
      childName={activeChild.fullName}
      childOptions={options.length > 1 ? options : undefined}
      onChildChange={setSelectedId}
    />
  );
}
