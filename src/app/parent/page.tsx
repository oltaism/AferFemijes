"use client";

import { useEffect, useState } from "react";
import { ParentDashboardKidcare } from "@/components/parent-dashboard-kidcare";
import { ApiBanner } from "@/components/api-banner";
import { fetchParentDashboard } from "@/lib/api/parent";
import { ApiError } from "@/lib/api/client";
import { useSession } from "@/lib/store";
import {
  children as mockChildren,
  reminders as mockReminders,
  risksFor,
} from "@/lib/mock-data";
import { scoreFor } from "@/lib/risk";
import type { ParentDashboardResponse } from "@/lib/api/parent";
import type { Reminder } from "@/lib/types";

export default function ParentDashboardPage() {
  const token = useSession((s) => s.accessToken);
  const [data, setData] = useState<ParentDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchParentDashboard(token)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => {
        setData(null);
        setError(
          e instanceof ApiError
            ? e.message
            : "Nuk u arrit lidhja me shërbimin. Provoni përsëri më vonë.",
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  const parentChildren = data?.children ?? mockChildren.filter(
    (c) => c.parentId === "parent-1",
  );
  const childIds = parentChildren.map((c) => c.id);
  const reminders: Reminder[] =
    data?.reminders ??
    mockReminders.filter((r) => childIds.includes(r.childId));

  const focus = data?.focusChild
    ? {
        child: data.focusChild.child,
        breakdown: data.focusChild.breakdown,
      }
    : (() => {
        const c =
          parentChildren
            .map((ch) => ({ c: ch, score: scoreFor(ch).score }))
            .sort((a, b) => b.score - a.score)[0]?.c ?? parentChildren[0];
        if (!c) return null;
        return { child: c, breakdown: scoreFor(c) };
      })();

  const alertCount = focus
    ? (data?.focusChild?.alerts?.length ?? risksFor(focus.child.id).length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="h-28 animate-pulse rounded-2xl bg-blue-50" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
            <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <ApiBanner error={error} />
      <ParentDashboardKidcare
        childList={parentChildren}
        reminders={reminders}
        focus={focus}
        alertCount={alertCount}
      />
    </div>
  );
}
