import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ScanSearch,
  BookOpenText,
  Users,
  Building2,
  Radio,
  ScrollText,
  BarChart3,
  DoorOpen,
  ScanLine,
  Bell,
  CircleUser,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tracking", label: "Roll Tracking", icon: ScanSearch },
  { to: "/passport", label: "Roll Passport", icon: BookOpenText },
  { to: "/rfid", label: "RFID Management", icon: Radio },
  { to: "/gates", label: "RFID Gates", icon: DoorOpen },
  { to: "/users", label: "User Management", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/audit", label: "Audit Logs", icon: ScrollText },
] as const;

export function AppLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ScanLine className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-sidebar-foreground">TraceWeave</p>
            <p className="text-[11px] text-muted-foreground">RFID Roll Traceability</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <CircleUser className="h-8 w-8 text-muted-foreground" />
            <div className="leading-tight">
              <p className="text-sm font-medium text-sidebar-foreground">Rajesh Verma</p>
              <p className="text-[11px] text-muted-foreground">Admin · Web</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              12 handhelds · 4 gates online
            </span>
            <button className="relative rounded-full p-2 text-muted-foreground hover:bg-accent">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
