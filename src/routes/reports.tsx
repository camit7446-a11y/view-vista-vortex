import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  departments,
  movements,
  productionTrend,
  rolls,
  userActivity,
} from "@/lib/mock-data";
import { statusVariant } from "./tracking";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — TraceWeave" },
      { name: "description", content: "Roll movement, history, department inventory, production summary, delayed roll and user activity reports." },
      { property: "og:title", content: "Reports — TraceWeave" },
      { property: "og:description", content: "Movement, traceability, department, production, delay and activity reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});

function exportCsv(name: string) {
  toast.success(`${name} export started — CSV will download when the backend is connected.`);
}

function ReportsPage() {
  const [from, setFrom] = useState("2026-09-12");
  const [to, setTo] = useState("2026-09-18");
  const [dept, setDept] = useState("all");
  const [rollNo, setRollNo] = useState("");

  const movementRows = useMemo(() => {
    return movements.filter((m) => {
      const d = m.timestamp.slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      if (dept !== "all" && m.destinationDept !== dept && m.sourceDept !== dept) return false;
      if (rollNo.trim()) {
        const r = rolls.find((x) => x.id === m.rollId);
        if (!r?.rollNumber.toLowerCase().includes(rollNo.trim().toLowerCase())) return false;
      }
      return true;
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 50);
  }, [from, to, dept, rollNo]);

  const delayed = rolls.filter((r) => ["Hold", "Rework", "QC Fail"].includes(r.currentStatus));

  return (
    <AppLayout title="Reports" subtitle="Movement, traceability, production and productivity reports">
      <Tabs defaultValue="movement">
        <TabsList className="flex-wrap">
          <TabsTrigger value="movement">Roll Movement</TabsTrigger>
          <TabsTrigger value="history">Roll History</TabsTrigger>
          <TabsTrigger value="department">Department</TabsTrigger>
          <TabsTrigger value="production">Production Summary</TabsTrigger>
          <TabsTrigger value="delayed">Delayed Rolls</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardContent className="flex flex-wrap items-end gap-3 p-4">
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Roll number</Label>
              <Input placeholder="Optional" value={rollNo} onChange={(e) => setRollNo(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <TabsContent value="movement">
          <ReportCard title="Roll Movement Report" onExport={() => exportCsv("Roll movement")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead><TableHead>Roll</TableHead><TableHead>From</TableHead>
                  <TableHead>To</TableHead><TableHead>Status</TableHead><TableHead>User</TableHead><TableHead>Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movementRows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{m.timestamp}</TableCell>
                    <TableCell className="font-medium">{rolls.find((r) => r.id === m.rollId)?.rollNumber}</TableCell>
                    <TableCell>{m.sourceDept}</TableCell>
                    <TableCell>{m.destinationDept}</TableCell>
                    <TableCell><Badge variant={statusVariant(m.status)}>{m.status}</Badge></TableCell>
                    <TableCell>{m.user}</TableCell>
                    <TableCell className="font-mono text-xs">{m.viaGate ?? m.device}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>

        <TabsContent value="history">
          <ReportCard title="Roll History Report — full traceability" onExport={() => exportCsv("Roll history")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll</TableHead><TableHead>Batch</TableHead><TableHead>Produced</TableHead>
                  <TableHead>Stages Completed</TableHead><TableHead>Current Dept.</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolls.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.rollNumber}</TableCell>
                    <TableCell>{r.batchNo}</TableCell>
                    <TableCell className="text-muted-foreground">{r.productionDate}</TableCell>
                    <TableCell>{movements.filter((m) => m.rollId === r.id).length}</TableCell>
                    <TableCell>{r.currentDepartment}</TableCell>
                    <TableCell><Badge variant={statusVariant(r.currentStatus)}>{r.currentStatus}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>

        <TabsContent value="department">
          <ReportCard title="Department Report — inventory by department" onExport={() => exportCsv("Department")}>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Seq.</TableHead><TableHead>Department</TableHead><TableHead>Code</TableHead><TableHead>Rolls Present</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.sequenceNo}</TableCell>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="font-mono text-xs">{d.code}</TableCell>
                    <TableCell>{rolls.filter((r) => r.currentDepartment === d.name).length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>

        <TabsContent value="production">
          <ReportCard title="Production Summary — daily woven rolls" onExport={() => exportCsv("Production summary")}>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Date</TableHead><TableHead>Rolls Produced</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {productionTrend.map((p) => (
                  <TableRow key={p.date}>
                    <TableCell className="font-medium">{p.date}</TableCell>
                    <TableCell>{p.rolls}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>

        <TabsContent value="delayed">
          <ReportCard title="Delayed Roll Report — hold, rework and failed rolls" onExport={() => exportCsv("Delayed roll")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll</TableHead><TableHead>Batch</TableHead><TableHead>Department</TableHead>
                  <TableHead>Status</TableHead><TableHead>Last Scan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delayed.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.rollNumber}</TableCell>
                    <TableCell>{r.batchNo}</TableCell>
                    <TableCell>{r.currentDepartment}</TableCell>
                    <TableCell><Badge variant={statusVariant(r.currentStatus)}>{r.currentStatus}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{r.lastScanTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>

        <TabsContent value="activity">
          <ReportCard title="User Activity Report — operator productivity today" onExport={() => exportCsv("User activity")}>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Operator</TableHead><TableHead>Scans / Transactions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {userActivity.map((u) => (
                  <TableRow key={u.user}>
                    <TableCell className="font-medium">{u.user}</TableCell>
                    <TableCell>{u.scans}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

function ReportCard({ title, onExport, children }: { title: string; onExport: () => void; children: React.ReactNode }) {
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </CardHeader>
      {children}
    </Card>
  );
}
