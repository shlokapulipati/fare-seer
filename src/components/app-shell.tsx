import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Plane,
  Code2,
  CalendarClock,
  ShieldCheck,
  Settings2,
  Search,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, emoji: "📈" },
  { to: "/basket", label: "Route basket", icon: Plane, emoji: "🛫" },
  { to: "/scrapers", label: "Scrapers & sources", icon: ShieldCheck, emoji: "🕸️" },
  { to: "/schedules", label: "Schedules", icon: CalendarClock, emoji: "⏱️" },
  { to: "/quality", label: "Data quality", icon: Settings2, emoji: "🧪" },
  { to: "/api", label: "API reference", icon: Code2, emoji: "🔌" },
] as const;

export function AppShell({
  title,
  breadcrumb,
  description,
  actions,
  children,
}: {
  title: string;
  breadcrumb: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Plane className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-sidebar-foreground">APIx Console</p>
            <p className="text-[11px] text-muted-foreground">MoSPI · NSO prototype</p>
          </div>
        </div>

        <div className="px-3 pb-2">
          <button className="flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-background/60 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent">
            <Search className="size-3.5" />
            Search routes, jobs, endpoints
            <kbd className="ml-auto rounded border border-border px-1 text-[10px]">⌘K</kbd>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-2">
          <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/60",
                )}
              >
                <span className="w-4 text-center text-[13px]">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2 rounded-md bg-background/60 px-2.5 py-2">
            <CircleDot className="size-3.5 text-success" />
            <div className="text-[11px] leading-tight">
              <p className="font-medium text-sidebar-foreground">Pipeline nominal</p>
              <p className="text-muted-foreground">Last sweep 04:56 IST</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex items-center gap-3 px-5 py-2.5 text-xs text-muted-foreground">
            <span>APIx</span>
            <span>/</span>
            <span className="text-foreground">{breadcrumb}</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 pb-16 pt-8 md:px-10">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{title}</h1>
              {description ? (
                <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  right,
  className,
  children,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("panel p-5", className)}>
      {title ? (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          {right}
        </header>
      ) : null}
      {children}
    </section>
  );
}
