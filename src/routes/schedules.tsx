import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { schedules } from "@/lib/apix-data";

export const Route = createFileRoute("/schedules")({
  head: () => ({
    meta: [
      { title: "Schedules & jobs — APIx" },
      {
        name: "description",
        content:
          "Cron schedules for daily airfare scraping sweeps, index computation and DGCA reconciliation jobs.",
      },
      { property: "og:title", content: "Schedules & jobs — APIx" },
      {
        property: "og:description",
        content: "Scrape sweeps, index computation and reconciliation job scheduling for APIx.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SchedulesPage,
});

function SchedulesPage() {
  return (
    <AppShell
      breadcrumb="Schedules"
      title="Schedules & jobs"
      description="Scheduled collection, cleaning and index-computation jobs. All times shown in IST; workers run with staggered offsets to respect per-host rate limits."
      actions={<Button size="sm">New schedule</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Runs completed today", "14"],
          ["Queued", "3"],
          ["Mean sweep duration", "31 min"],
        ].map(([k, v]) => (
          <div key={k} className="panel p-4">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="tabular mt-1.5 text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </div>

      <Panel className="mt-4" title="Configured schedules">
        <ul className="divide-y divide-border">
          {schedules.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <div className="min-w-[220px] flex-1">
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.target}</p>
              </div>
              <code className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-foreground">
                {s.cron}
              </code>
              <div className="w-36 text-xs">
                <p className="text-foreground">{s.next}</p>
                <p className="text-muted-foreground">avg {s.avg}</p>
              </div>
              <Badge
                variant="secondary"
                className={`rounded-md font-normal ${s.status === "active" ? "text-success" : "text-muted-foreground"}`}
              >
                {s.status}
              </Badge>
              <Switch defaultChecked={s.status === "active"} />
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="mt-4" title="Upcoming window" subtitle="Next 12 hours, IST">
        <div className="relative overflow-hidden rounded-lg border border-border">
          {["04:00 Daily airline sweep", "06:15 Index computation", "11:30 Surge micro-poll", "16:30 OTA cross-check"].map(
            (row, i) => (
              <div
                key={row}
                className="flex items-center gap-3 border-b border-border/60 px-3 py-2.5 text-sm last:border-0"
              >
                <span className="tabular w-12 text-xs text-muted-foreground">{row.slice(0, 5)}</span>
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{ width: `${[68, 22, 14, 44][i]}%`, opacity: 0.85 }}
                  />
                </div>
                <span className="w-56 text-xs text-foreground">{row.slice(6)}</span>
              </div>
            ),
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
