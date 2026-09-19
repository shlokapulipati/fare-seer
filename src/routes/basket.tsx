import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, Panel } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { LEAD_WINDOWS, ROUTES } from "@/lib/apix-data";

export const Route = createFileRoute("/basket")({
  head: () => ({
    meta: [
      { title: "Route basket & weights — APIx" },
      {
        name: "description",
        content:
          "Representative city-pair basket for the Airfare Price Index with DGCA passenger-traffic based PSD weights.",
      },
      { property: "og:title", content: "Route basket & weights — APIx" },
      {
        property: "og:description",
        content: "City-pair basket, PSD weights and advance-purchase windows for APIx.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BasketPage,
});

function BasketPage() {
  const data = [...ROUTES].sort((a, b) => b.weight - a.weight);

  return (
    <AppShell
      breadcrumb="Route basket"
      title="Route basket & weights"
      description="Twelve trunk city-pairs selected from DGCA passenger-traffic data. Weights follow the PSD share of domestic passengers carried and are revised annually."
      actions={<Badge variant="secondary" className="rounded-md font-normal">Revision: FY 2026-27</Badge>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="PSD weight distribution" subtitle="Share of basket, %">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: -18, right: 8, top: 6 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="code"
                  stroke="var(--color-muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  angle={-35}
                  height={48}
                  textAnchor="end"
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
                <Bar dataKey="weight" fill="var(--color-chart-1)" radius={[5, 5, 0, 0]} name="PSD weight %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Capture design" subtitle="Per sector, per day">
            <dl className="space-y-3 text-sm">
              {[
                ["Advance-purchase windows", LEAD_WINDOWS.join(" · ")],
                ["Departure slots", "Morning · Midday · Evening"],
                ["Fare classes", "Economy Saver, Flex, Premium Economy"],
                ["Quotes per sector/day", "~7,170"],
                ["Index formula", "Chained Laspeyres, geometric mean of price relatives"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 border-b border-border/60 pb-2 last:border-0">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Coverage" subtitle="Basket vs national traffic">
            <p className="text-3xl font-semibold text-foreground">64.2%</p>
            <p className="mt-1 text-xs text-muted-foreground">
              of domestic scheduled passengers carried, per latest DGCA monthly traffic report.
            </p>
          </Panel>
        </div>
      </div>

      <Panel className="mt-4" title="Basket composition" subtitle="Click-through to sector sub-index in production">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium">Sector</th>
                <th className="py-2 text-left font-medium">Origin</th>
                <th className="py-2 text-left font-medium">Destination</th>
                <th className="py-2 text-right font-medium">Pax share</th>
                <th className="py-2 text-right font-medium">PSD weight</th>
                <th className="py-2 text-right font-medium">Mean fare</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.code} className="border-b border-border/60 last:border-0">
                  <td className="py-2 font-mono text-xs">{r.code}</td>
                  <td className="py-2 text-muted-foreground">{r.origin}</td>
                  <td className="py-2 text-muted-foreground">{r.destination}</td>
                  <td className="tabular py-2 text-right">{r.paxShare.toFixed(1)}%</td>
                  <td className="tabular py-2 text-right">{r.weight.toFixed(1)}%</td>
                  <td className="tabular py-2 text-right">₹{r.avgFare.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
