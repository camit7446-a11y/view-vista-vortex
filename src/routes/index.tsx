import { createFileRoute } from "@tanstack/react-router";
import {
  Layers,
  Activity,
  Factory,
  AlarmClock,
  ClipboardCheck,
  Truck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dailyDispatch,
  getKpis,
  productionTrend,
  qcStatusBreakdown,
  rollsByDepartment,
  userActivity,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TraceWeave RFID Roll Traceability" },
      { name: "description", content: "Live plant KPIs, department load, production trend, QC status and dispatch activity for the RFID fabric roll traceability system." },
      { property: "og:title", content: "Dashboard — TraceWeave RFID Roll Traceability" },
      { property: "og:description", content: "Live plant KPIs, department load, production trend, QC status and dispatch activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const QC_COLORS: Record<string, string> = {
  "QC Pass": "oklch(0.65 0.17 155)",
  "Pending QC": "oklch(0.75 0.15 85)",
  "QC Fail": "oklch(0.577 0.245 27)",
  Rework: "oklch(0.6 0.15 250)",
  Hold: "oklch(0.6 0.02 260)",
};

function Dashboard() {
  const kpis = getKpis();
  const cards = [
    { label: "Total Rolls", value: kpis.total.toLocaleString(), icon: Layers, hint: "incl. archived" },
    { label: "Active Rolls", value: String(kpis.active), icon: Activity, hint: "in pipeline now" },
    { label: "Today's Production", value: String(kpis.today), icon: Factory, hint: "rolls woven today" },
    { label: "Delayed Rolls", value: String(kpis.delayed), icon: AlarmClock, hint: "hold / rework / fail" },
    { label: "Pending QC", value: String(kpis.pendingQc), icon: ClipboardCheck, hint: "awaiting inspection" },
    { label: "Dispatch Count", value: String(kpis.dispatched), icon: Truck, hint: "shipped today" },
  ];

  return (
    <AppLayout title="Plant Dashboard" subtitle="Friday, 18 September 2026 · All departments">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
                <c.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{c.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Production Trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="rolls" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Department-wise Rolls</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rollsByDepartment()}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, _n, item) => [v, item.payload.name]} />
                <Bar dataKey="rolls" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">QC Status</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={qcStatusBreakdown()} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {qcStatusBreakdown().map((entry) => (
                    <Cell key={entry.name} fill={QC_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 pb-2">
              {qcStatusBreakdown().map((e) => (
                <span key={e.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: QC_COLORS[e.name] }} />
                  {e.name} ({e.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Daily Dispatch</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyDispatch}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="dispatched" fill="oklch(0.6 0.118 184.704)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">User Activity — scans today</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivity} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="user" tick={{ fontSize: 11 }} width={70} />
                <Tooltip />
                <Bar dataKey="scans" fill="oklch(0.646 0.15 41)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
