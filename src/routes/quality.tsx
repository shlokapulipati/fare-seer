import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, Panel } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { indexSeries, qualityChecks } from "@/lib/apix-data";

export const Route = createFileRoute("/quality")({
  head: () => ({
    meta: [
      { title: "Data quality & back-testing — APIx" },
      {
        name: "description",
        content:
          "Cleaning-pipeline checks, outlier handling and 30-day back-test of APIx against DGCA monthly average fares.",
      },
      { property: "og:title", content: "Data quality & back-testing — APIx" },
      {
        property: "og:description",
        content: "Pipeline checks, outlier removal and DGCA back-test accuracy for APIx.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QualityPage,
});

function QualityPage() {
  const back = indexSeries.slice(-30).map((d) => ({
    date: d.date.slice(5),
    deviation: Number((d.apix - d.dgca).toFixed(2)),
  }));

  return (
    <AppShell
      breadcrumb="Data quality"
      title="Data quality & back-testing"
      description="Every quote passes six deterministic checks before it enters the index. Back-tests compare 30 days of APIx movement with DGCA published monthly average fares."
      actions={<Badge variant="secondary" className="rounded-md font-normal">MAPE 1.42% · ρ 0.963</Badge>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Back-test deviation" subtitle="APIx minus DGCA reference, index points">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={back} margin={{ left: -20, right: 8, top: 6 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="deviation"
                  stroke="var(--color-chart-4)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Fare decomposition" subtitle="Share of total ticket price">
          <ul className="space-y-3 text-sm">
            {[
              ["Base fare", 71.4, "var(--color-chart-1)"],
              ["Taxes & fees", 16.2, "var(--color-chart-2)"],
              ["User development fee", 7.1, "var(--color-chart-3)"],
              ["Convenience charges", 5.3, "var(--color-chart-5)"],
            ].map(([label, pct, color]) => (
              <li key={label as string}>
                <div className="flex justify-between text-xs">
                  <span>{label}</span>
                  <span className="tabular text-muted-foreground">{pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color as string }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-4" title="Cleaning pipeline checks" subtitle="Last completed run · 06:15 IST">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium">Check</th>
                <th className="py-2 text-left font-medium">Scope</th>
                <th className="py-2 text-left font-medium">Result</th>
                <th className="py-2 text-right font-medium">State</th>
              </tr>
            </thead>
            <tbody>
              {qualityChecks.map((c) => (
                <tr key={c.check} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 text-foreground">{c.check}</td>
                  <td className="py-2.5 text-muted-foreground">{c.scope}</td>
                  <td className="py-2.5 text-muted-foreground">{c.result}</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] ${c.state === "pass" ? "bg-success/12 text-success" : "bg-warning/15 text-warning"}`}
                    >
                      {c.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
