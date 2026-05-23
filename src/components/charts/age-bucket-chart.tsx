"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ageBucketStats } from "@/lib/mock-data";

export function AgeBucketChart({
  data: chartData,
}: {
  data?: typeof ageBucketStats;
}) {
  const series = chartData ?? ageBucketStats;
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-slate-900">Sipas grupmoshës</h3>
      <p className="text-sm text-slate-500">
        Kontrolle dhe vaksina · sipas moshës.
      </p>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="age" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="missedCheckups"
              name="Kontrolle të humbura"
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="overdueVaccines"
              name="Vaksina me vonesë"
              fill="#7c3aed"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
