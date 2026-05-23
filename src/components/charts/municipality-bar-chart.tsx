"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { municipalityAnalytics } from "@/lib/mock-data";

export function MunicipalityCoverageChart({
  municipalities,
}: {
  municipalities?: typeof municipalityAnalytics;
}) {
  const source = municipalities ?? municipalityAnalytics;
  const data = source.map((m) => ({
    name: m.municipality,
    coverage: m.coveragePercent,
  }));
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-slate-900">Mbulimi sipas komunës</h3>
      <p className="text-sm text-slate-500">
        Përqindja e mbulimit të vaksinimit sipas komunës.
      </p>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[0, 100]}
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#64748b"
              fontSize={12}
              width={90}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v}%`, "Mbulimi"]}
            />
            <Bar dataKey="coverage" radius={[0, 6, 6, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.coverage >= 90
                      ? "#16a34a"
                      : d.coverage >= 80
                        ? "#3b82f6"
                        : d.coverage >= 70
                          ? "#f59e0b"
                          : "#dc2626"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
