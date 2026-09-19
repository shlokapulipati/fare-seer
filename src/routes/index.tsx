import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import {
  CARRIERS,
  heatmap,
  indexSeries,
  kpis,
  LEAD_WINDOWS,
  leadTimeCurve,
  ROUTES,
} from "@/lib/apix-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "APIx Dashboard — Real-time Airfare Price Index" },
      {
        name: "description",
        content:
          "Daily Airfare Price Index for India built from scraped airline and OTA fares, with sector heatmaps and DGCA back-testing.",
      },
      { property: "og:title", content: "APIx Dashboard — Real-time Airfare Price Index" },
      {
        property: "og:description",
        content: "Daily APIx index, sector heatmaps, lead-time elasticity and DGCA back-tests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

function ChartTooltip() {
  return (
    <Tooltip
      cursor={{ stroke: "var(--color-border)" }}
      contentStyle={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        fontSize: 12,
        boxShadow: "var(--shadow-panel)",
      }}
    />
  );
}

function heatColor(v: number, min: number, max: number) {
  const t = (v - min) / Math.max(1, max - min);
  return `color-mix(in oklab, var(--color-chart-2) ${Math.round(12 + t * 78)}%, var(--color-card))`;
}

function Dashboard() {
  const recent = indexSeries.slice(-60);
  const allCells = heatmap.flatMap((r) => r.cells.map((c) => c.value));
  const min = Math.min(...allCells);
  const max = Math.max(...allCells);

  return (
    <AppShell
      breadcrumb="Dashboard"
      title="Airfare Price Index"
      description="Daily APIx computed from 86,040 cleaned fare quotes across 5 airlines and 4 OTAs, covering 12 trunk sectors and 5 advance-purchase windows."
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-md font-normal">
            Base 2026-06 = 100
          </Badge>
          <Badge className="rounded-md bg-accent font-normal text-accent-foreground">
            Updated 19 Sep, 06:15 IST
          </Badge>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="panel p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="tabular mt-2 text-2xl font-semibold text-foreground">{k.value}</p>
            <p className="mt-1 text-xs">
              <span
                className={
                  k.tone === "up"
                    ? "text-success"
                    : k.tone === "down"
                      ? "text-accent"
                      : "text-warning"
                }
              >
                {k.delta}
              </span>{" "}
              <span className="text-muted-foreground">{k.note}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="APIx vs DGCA reference series"
          subtitle="Last 60 days, index points"
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recent} margin={{ left: -18, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="apixFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" {...axis} tickFormatter={(v: string) => v.slice(5)} minTickGap={28} />
                <YAxis {...axis} domain={["dataMin - 2", "dataMax + 2"]} />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="apix"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#apixFill)"
                  name="APIx"
                />
                <Line
                  type="monotone"
                  dataKey="dgca"
                  stroke="var(--color-chart-2)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  name="DGCA avg fare (rebased)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Lead-time elasticity" subtitle="Mean total fare by booking window">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadTimeCurve} margin={{ left: -14, right: 6, top: 6 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="window" {...axis} />
                <YAxis {...axis} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <ChartTooltip />
                <Bar dataKey="fare" fill="var(--color-chart-1)" radius={[5, 5, 0, 0]} name="₹ fare" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="tabular mt-2 flex justify-between text-[11px] text-muted-foreground">
            {leadTimeCurve.map((p) => (
              <span key={p.window}>ε {p.elasticity}</span>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Sector × advance-purchase heatmap"
          subtitle="Mean total fare (₹) captured in the last sweep"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-1 text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="w-24 text-left font-medium">Sector</th>
                  {LEAD_WINDOWS.map((w) => (
                    <th key={w} className="font-medium">
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.map((row) => (
                  <tr key={row.route}>
                    <td className="font-mono text-[11px] text-foreground">{row.route}</td>
                    {row.cells.map((c) => (
                      <td
                        key={c.window}
                        className="tabular rounded-md px-2 py-1.5 text-center text-foreground"
                        style={{ background: heatColor(c.value, min, max) }}
                      >
                        {c.value.toLocaleString("en-IN")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Quote share by carrier" subtitle="Share of cleaned quotes, last 24h">
          <ul className="space-y-3">
            {CARRIERS.map((c) => (
              <li key={c.name}>
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">{c.name}</span>
                  <span className="tabular text-muted-foreground">{c.share}%</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.share}%`, background: c.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        className="mt-4"
        title="Sector sub-indices"
        subtitle="PSD-weighted contribution to the all-India APIx"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium">Sector</th>
                <th className="py-2 text-left font-medium">City-pair</th>
                <th className="py-2 text-right font-medium">PSD weight</th>
                <th className="py-2 text-right font-medium">Mean fare</th>
                <th className="py-2 text-right font-medium">MoM</th>
              </tr>
            </thead>
            <tbody>
              {ROUTES.map((r) => (
                <tr key={r.code} className="border-b border-border/60 last:border-0">
                  <td className="py-2 font-mono text-xs">{r.code}</td>
                  <td className="py-2 text-muted-foreground">
                    {r.origin} → {r.destination}
                  </td>
                  <td className="tabular py-2 text-right">{r.weight.toFixed(1)}%</td>
                  <td className="tabular py-2 text-right">₹{r.avgFare.toLocaleString("en-IN")}</td>
                  <td
                    className={`tabular py-2 text-right ${r.mom >= 0 ? "text-success" : "text-accent"}`}
                  >
                    {r.mom >= 0 ? "+" : ""}
                    {r.mom.toFixed(1)}%
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
