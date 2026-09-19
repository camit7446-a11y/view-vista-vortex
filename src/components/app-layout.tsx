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
  Menu,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {navItems.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
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
  );
}

function BrandMark() {
  return (
    <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ScanLine className="h-5 w-5" />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-sm font-semibold text-sidebar-foreground">TraceWeave</p>
        <p className="text-[11px] text-muted-foreground">RFID Roll Traceability</p>
      </div>
    </div>
  );
}

function UserFooter() {
  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="flex items-center gap-3">
        <CircleUser className="h-8 w-8 shrink-0 text-muted-foreground" />
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-medium text-sidebar-foreground">Rajesh Verma</p>
          <p className="text-[11px] text-muted-foreground">Admin · Web</p>
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <BrandMark />
        <NavLinks pathname={pathname} />
        <UserFooter />
      </aside>

      {/* Sidebar — mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-72 flex-col border-sidebar-border bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <BrandMark />
          <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <UserFooter />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">{title}</h1>
              {subtitle ? <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p> : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              12 handhelds · 4 gates online
            </span>
            <button className="relative rounded-full p-2 text-muted-foreground hover:bg-accent" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
