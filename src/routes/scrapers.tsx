import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SOURCES, runLog } from "@/lib/apix-data";

export const Route = createFileRoute("/scrapers")({
  head: () => ({
    meta: [
      { title: "Scrapers & sources — APIx" },
      {
        name: "description",
        content:
          "Health, throughput and compliance controls for the airline and OTA airfare scraping engine.",
      },
      { property: "og:title", content: "Scrapers & sources — APIx" },
      {
        property: "og:description",
        content: "Source health, rate limits, proxy rotation and ethical-scraping safeguards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScrapersPage,
});

const statusTone: Record<string, string> = {
  healthy: "bg-success/12 text-success",
  degraded: "bg-warning/15 text-warning",
  throttled: "bg-destructive/12 text-destructive",
};

function ScrapersPage() {
  return (
    <AppShell
      breadcrumb="Scrapers & sources"
      title="Scrapers & sources"
      description="Nine collection agents across airline portals and OTAs, each governed by robots.txt revalidation, per-host rate limits and rotating residential egress."
      actions={<Badge variant="secondary" className="rounded-md font-normal">8 of 9 agents passing</Badge>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Source registry" subtitle="Last 24h">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium">Source</th>
                  <th className="py-2 text-left font-medium">Type</th>
                  <th className="py-2 text-left font-medium">Engine</th>
                  <th className="py-2 text-right font-medium">Quotes</th>
                  <th className="py-2 text-right font-medium">Avg latency</th>
                  <th className="py-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {SOURCES.map((s) => (
                  <tr key={s.name} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5">
                      <p className="text-foreground">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">Last run {s.lastRun}</p>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{s.type}</td>
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">{s.engine}</td>
                    <td className="tabular py-2.5 text-right">{s.quotes.toLocaleString("en-IN")}</td>
                    <td className="tabular py-2.5 text-right">{s.latency}s</td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] capitalize ${statusTone[s.status]}`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Compliance controls" subtitle="Applied to every agent">
            <ul className="space-y-3 text-sm">
              {[
                ["robots.txt revalidation", true],
                ["Per-host rate limit (1 req / 4s)", true],
                ["Residential IP rotation", true],
                ["Session & cookie jar reuse", true],
                ["Headless fingerprint masking", true],
                ["Bypass paid-CAPTCHA solvers", false],
              ].map(([label, on]) => (
                <li key={label as string} className="flex items-center justify-between gap-3">
                  <span className="text-foreground">{label}</span>
                  <Switch defaultChecked={on as boolean} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Run log" subtitle="Today's sweep">
            <ul className="space-y-2.5 text-xs">
              {runLog.map((l, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="tabular w-10 shrink-0 text-muted-foreground">{l.time}</span>
                  <span
                    className={`mt-1.5 size-1.5 shrink-0 rounded-full ${l.level === "ok" ? "bg-success" : "bg-warning"}`}
                  />
                  <span className="text-foreground">
                    <span className="font-medium">{l.source}</span>{" "}
                    <span className="text-muted-foreground">{l.msg}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
