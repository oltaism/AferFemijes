import { CheckCircle2, ShieldCheck } from "lucide-react";
import { vaccinesFor } from "@/lib/mock-data";
import { Vaccine } from "@/lib/types";
import { SafetyBanner } from "./safety-banner";
import { VaccineStatusChip } from "./status-chip";
import { formatDate } from "@/lib/utils";

export function VaccineSchedule({
  childId,
  vaccines: vaccinesProp,
}: {
  childId: string;
  vaccines?: Vaccine[];
}) {
  const list = (vaccinesProp ?? vaccinesFor(childId)).slice().sort(
    (a, b) => a.recommendedAgeMonths - b.recommendedAgeMonths,
  );

  return (
    <div className="space-y-4">
      <SafetyBanner />
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Vaksina</th>
              <th className="px-4 py-3 font-medium">Mosha</th>
              <th className="px-4 py-3 font-medium">Data e afatit</th>
              <th className="px-4 py-3 font-medium">Statusi</th>
              <th className="px-4 py-3 font-medium">Konfirmuar</th>
              <th className="px-4 py-3 font-medium">Rikthim</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((v) => (
              <Row key={v.id} v={v} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ v }: { v: Vaccine }) {
  const catchUp = v.status === "catch-up";
  return (
    <tr>
      <td className="px-4 py-3 font-medium text-slate-900">{v.name}</td>
      <td className="px-4 py-3 text-slate-600">{v.recommendedAgeMonths} muaj</td>
      <td className="px-4 py-3 text-slate-600">{formatDate(v.dueDate)}</td>
      <td className="px-4 py-3">
        <VaccineStatusChip status={v.status} />
      </td>
      <td className="px-4 py-3">
        {v.providerConfirmed ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Mjeku
          </span>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {catchUp ? (
          <span className="inline-flex items-center gap-1 text-xs text-violet-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Kërkon rikthim në normë
          </span>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )}
      </td>
    </tr>
  );
}
