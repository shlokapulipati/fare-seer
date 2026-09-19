/**
 * Mock data layer for the APIx prototype.
 * Deterministic pseudo-random generation so charts are stable across renders.
 */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Route = {
  code: string;
  origin: string;
  destination: string;
  weight: number; // PSD weight in basket
  paxShare: number;
  avgFare: number;
  mom: number;
};

export const ROUTES: Route[] = [
  { code: "DEL-BOM", origin: "Delhi", destination: "Mumbai", weight: 14.2, paxShare: 9.1, avgFare: 7420, mom: 3.4 },
  { code: "DEL-BLR", origin: "Delhi", destination: "Bengaluru", weight: 11.8, paxShare: 7.6, avgFare: 8150, mom: -1.2 },
  { code: "BOM-BLR", origin: "Mumbai", destination: "Bengaluru", weight: 9.6, paxShare: 6.2, avgFare: 5380, mom: 2.1 },
  { code: "DEL-CCU", origin: "Delhi", destination: "Kolkata", weight: 8.4, paxShare: 5.4, avgFare: 6890, mom: 5.7 },
  { code: "BLR-HYD", origin: "Bengaluru", destination: "Hyderabad", weight: 6.9, paxShare: 4.4, avgFare: 3940, mom: -0.8 },
  { code: "MAA-DEL", origin: "Chennai", destination: "Delhi", weight: 7.7, paxShare: 5.0, avgFare: 8630, mom: 4.2 },
  { code: "DEL-HYD", origin: "Delhi", destination: "Hyderabad", weight: 7.1, paxShare: 4.6, avgFare: 7210, mom: 1.5 },
  { code: "BOM-DEL", origin: "Mumbai", destination: "Delhi", weight: 13.6, paxShare: 8.8, avgFare: 7380, mom: 2.8 },
  { code: "BOM-GOI", origin: "Mumbai", destination: "Goa", weight: 5.2, paxShare: 3.3, avgFare: 4120, mom: 9.4 },
  { code: "DEL-PNQ", origin: "Delhi", destination: "Pune", weight: 5.8, paxShare: 3.7, avgFare: 6640, mom: -2.6 },
  { code: "CCU-BLR", origin: "Kolkata", destination: "Bengaluru", weight: 4.9, paxShare: 3.1, avgFare: 6980, mom: 0.9 },
  { code: "MAA-BOM", origin: "Chennai", destination: "Mumbai", weight: 4.8, paxShare: 3.0, avgFare: 5760, mom: 1.8 },
];

export const CARRIERS = [
  { name: "IndiGo", share: 62.1, color: "var(--color-chart-1)" },
  { name: "Air India", share: 14.8, color: "var(--color-chart-2)" },
  { name: "Air India Express", share: 8.3, color: "var(--color-chart-3)" },
  { name: "Akasa Air", share: 8.1, color: "var(--color-chart-4)" },
  { name: "SpiceJet", share: 6.7, color: "var(--color-chart-5)" },
];

export const SOURCES = [
  { name: "IndiGo (goindigo.in)", type: "Airline", engine: "Playwright", status: "healthy", quotes: 18420, lastRun: "04:12 IST", latency: 1.9 },
  { name: "Air India", type: "Airline", engine: "Playwright", status: "healthy", quotes: 12980, lastRun: "04:18 IST", latency: 2.6 },
  { name: "Akasa Air", type: "Airline", engine: "Scrapy", status: "healthy", quotes: 7440, lastRun: "04:25 IST", latency: 1.2 },
  { name: "SpiceJet", type: "Airline", engine: "Selenium", status: "degraded", quotes: 4110, lastRun: "04:31 IST", latency: 6.8 },
  { name: "MakeMyTrip", type: "OTA", engine: "Playwright", status: "healthy", quotes: 21350, lastRun: "04:40 IST", latency: 3.1 },
  { name: "EaseMyTrip", type: "OTA", engine: "Scrapy", status: "healthy", quotes: 9870, lastRun: "04:44 IST", latency: 1.5 },
  { name: "Cleartrip", type: "OTA", engine: "Playwright", status: "throttled", quotes: 3220, lastRun: "04:51 IST", latency: 8.4 },
  { name: "Ixigo", type: "OTA", engine: "Scrapy", status: "healthy", quotes: 8640, lastRun: "04:56 IST", latency: 1.7 },
];

export const LEAD_WINDOWS = ["T+1", "T+7", "T+15", "T+30", "T+45"] as const;

const rnd = mulberry32(20260919);

export const indexSeries = (() => {
  const out: { date: string; apix: number; dgca: number; volume: number }[] = [];
  let level = 100;
  const start = new Date(Date.UTC(2026, 5, 1));
  for (let i = 0; i < 110; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const season = Math.sin(i / 14) * 1.8;
    level = level + season * 0.5 + (rnd() - 0.45) * 1.4;
    out.push({
      date: d.toISOString().slice(0, 10),
      apix: Number(level.toFixed(2)),
      dgca: Number((level + Math.sin(i / 9) * 1.6 - 0.4).toFixed(2)),
      volume: Math.round(72000 + rnd() * 26000),
    });
  }
  return out;
})();

export const leadTimeCurve = LEAD_WINDOWS.map((w, i) => ({
  window: w,
  fare: Math.round([13800, 9200, 7400, 5900, 5400][i] * (1 + (rnd() - 0.5) * 0.04)),
  elasticity: Number((-[1.62, 0.94, 0.61, 0.28, 0.12][i]).toFixed(2)),
}));

export const heatmap = ROUTES.slice(0, 8).map((r) => ({
  route: r.code,
  cells: LEAD_WINDOWS.map((w) => ({
    window: w,
    value: Number((r.avgFare * [1.9, 1.32, 1.05, 0.86, 0.8][LEAD_WINDOWS.indexOf(w)]).toFixed(0)),
  })),
}));

export const kpis = [
  { label: "APIx (All-India, daily)", value: "112.68", delta: "+0.84%", tone: "up" as const, note: "vs previous day" },
  { label: "Quotes ingested (24h)", value: "86,040", delta: "+4.1%", tone: "up" as const, note: "across 8 sources" },
  { label: "Back-test deviation vs DGCA", value: "1.42%", delta: "-0.21pp", tone: "down" as const, note: "30-day MAPE" },
  { label: "Pipeline health", value: "96.3%", delta: "2 warnings", tone: "flat" as const, note: "scrapers passing" },
];

export const schedules = [
  { id: "sch_001", name: "Daily airline sweep", cron: "0 04 * * *", target: "5 airline portals x 12 routes x 5 windows", next: "Tomorrow 04:00 IST", status: "active", avg: "38 min" },
  { id: "sch_002", name: "OTA cross-check sweep", cron: "30 04,16 * * *", target: "4 OTAs x 12 routes x 5 windows", next: "Today 16:30 IST", status: "active", avg: "52 min" },
  { id: "sch_003", name: "Festival surge micro-poll", cron: "*/90 * * * *", target: "Top 4 trunk routes, T+1/T+7", next: "Today 11:30 IST", status: "active", avg: "6 min" },
  { id: "sch_004", name: "Index computation (daily)", cron: "15 06 * * *", target: "APIx daily, Laspeyres w/ PSD weights", next: "Tomorrow 06:15 IST", status: "active", avg: "2 min" },
  { id: "sch_005", name: "Weekly + monthly aggregation", cron: "0 07 * * 1", target: "APIx weekly, monthly, sector sub-indices", next: "Monday 07:00 IST", status: "active", avg: "4 min" },
  { id: "sch_006", name: "DGCA back-test reconciliation", cron: "0 09 1 * *", target: "Monthly average-fare comparison", next: "1 Oct, 09:00 IST", status: "paused", avg: "11 min" },
];

export const runLog = [
  { time: "04:56", source: "Ixigo", msg: "8,640 quotes parsed, 41 dropped as outliers", level: "ok" },
  { time: "04:51", source: "Cleartrip", msg: "Rate-limit backoff engaged (429) — retry queued at 05:20", level: "warn" },
  { time: "04:44", source: "EaseMyTrip", msg: "9,870 quotes parsed, fare/tax split verified", level: "ok" },
  { time: "04:40", source: "MakeMyTrip", msg: "21,350 quotes parsed across 12 sectors", level: "ok" },
  { time: "04:31", source: "SpiceJet", msg: "CAPTCHA challenge on 3 sessions — solved via rotation", level: "warn" },
  { time: "04:25", source: "Akasa Air", msg: "7,440 quotes parsed, 0 schema drift", level: "ok" },
  { time: "04:18", source: "Air India", msg: "12,980 quotes parsed, 118 sold-out sectors flagged", level: "ok" },
  { time: "04:12", source: "IndiGo", msg: "18,420 quotes parsed, robots.txt revalidated", level: "ok" },
];

export const qualityChecks = [
  { check: "Outlier removal (MAD, k=3.5)", scope: "All quotes", result: "1,842 removed (2.1%)", state: "pass" },
  { check: "Duplicate fingerprint collapse", scope: "source+route+dep+window", result: "6,310 collapsed", state: "pass" },
  { check: "Base fare / tax / UDF split", scope: "All quotes", result: "99.4% decomposed", state: "pass" },
  { check: "Missing-value imputation", scope: "Sold-out sectors", result: "212 carried-forward", state: "warn" },
  { check: "Currency & unit normalisation", scope: "All quotes", result: "100% INR", state: "pass" },
  { check: "Schema drift detection", scope: "8 sources", result: "1 selector updated (SpiceJet)", state: "warn" },
];

export type ApiEndpoint = {
  method: "GET" | "POST";
  path: string;
  summary: string;
  tag: string;
  params: { name: string; in: string; type: string; desc: string }[];
  response: string;
};

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/v1/index/daily",
    summary: "Daily Airfare Price Index (APIx) series",
    tag: "Index",
    params: [
      { name: "from", in: "query", type: "date", desc: "Start date (ISO-8601)" },
      { name: "to", in: "query", type: "date", desc: "End date (ISO-8601)" },
      { name: "base", in: "query", type: "string", desc: "Base period, default 2026-06=100" },
    ],
    response: `{
  "frequency": "daily",
  "base_period": "2026-06=100",
  "series": [
    { "date": "2026-09-18", "apix": 111.74, "yoy": 4.61 },
    { "date": "2026-09-19", "apix": 112.68, "yoy": 5.02 }
  ]
}`,
  },
  {
    method: "GET",
    path: "/v1/index/sector/{route}",
    summary: "Sector-level sub-index for a city-pair",
    tag: "Index",
    params: [
      { name: "route", in: "path", type: "string", desc: "IATA city-pair, e.g. DEL-BOM" },
      { name: "frequency", in: "query", type: "enum", desc: "daily | weekly | monthly" },
    ],
    response: `{
  "route": "DEL-BOM",
  "frequency": "weekly",
  "weight_psd": 14.2,
  "series": [ { "week": "2026-W37", "index": 114.30 } ]
}`,
  },
  {
    method: "GET",
    path: "/v1/fares/quotes",
    summary: "Cleaned, de-duplicated fare quotes",
    tag: "Fares",
    params: [
      { name: "route", in: "query", type: "string", desc: "City-pair filter" },
      { name: "carrier", in: "query", type: "string", desc: "Operating carrier" },
      { name: "window", in: "query", type: "enum", desc: "T+1 | T+7 | T+15 | T+30 | T+45" },
      { name: "limit", in: "query", type: "int", desc: "Page size, max 1000" },
    ],
    response: `{
  "count": 2,
  "quotes": [
    {
      "quote_id": "q_8f31c",
      "captured_at": "2026-09-19T04:12:11Z",
      "source": "goindigo.in",
      "route": "DEL-BOM",
      "carrier": "IndiGo",
      "window": "T+7",
      "fare_class": "Economy Saver",
      "base_fare": 5120,
      "taxes": 812,
      "udf": 236,
      "convenience_fee": 0,
      "total_fare": 6168
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/v1/fares/leadtime-curve",
    summary: "Lead-time elasticity curve by sector",
    tag: "Fares",
    params: [{ name: "route", in: "query", type: "string", desc: "City-pair filter" }],
    response: `{ "route": "DEL-BLR", "points": [ { "window": "T+1", "mean_fare": 13842, "elasticity": -1.62 } ] }`,
  },
  {
    method: "GET",
    path: "/v1/basket/routes",
    summary: "Basket composition and PSD weights",
    tag: "Basket",
    params: [],
    response: `{ "routes": [ { "route": "DEL-BOM", "weight_psd": 14.2, "pax_share": 9.1 } ] }`,
  },
  {
    method: "POST",
    path: "/v1/jobs/scrape/trigger",
    summary: "Trigger an ad-hoc scrape run (admin)",
    tag: "Operations",
    params: [
      { name: "sources", in: "body", type: "string[]", desc: "Source slugs to run" },
      { name: "routes", in: "body", type: "string[]", desc: "City-pairs to cover" },
    ],
    response: `{ "job_id": "job_2f91", "status": "queued", "eta_minutes": 34 }`,
  },
  {
    method: "GET",
    path: "/v1/jobs/{job_id}",
    summary: "Job status and run telemetry",
    tag: "Operations",
    params: [{ name: "job_id", in: "path", type: "string", desc: "Job identifier" }],
    response: `{ "job_id": "job_2f91", "status": "succeeded", "quotes": 4210, "duration_s": 1880 }`,
  },
  {
    method: "GET",
    path: "/v1/backtest/dgca",
    summary: "Back-test of APIx against DGCA monthly average fares",
    tag: "Validation",
    params: [{ name: "months", in: "query", type: "int", desc: "Lookback window in months" }],
    response: `{ "mape": 1.42, "correlation": 0.963, "months": 3 }`,
  },
];
