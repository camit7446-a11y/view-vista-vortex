import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { departments, rolls, type RollStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/tracking")({
  head: () => ({
    meta: [
      { title: "Roll Tracking — TraceWeave" },
      { name: "description", content: "Search fabric rolls by roll number, RFID EPC, batch or date and see current department, status, location and last scan time." },
      { property: "og:title", content: "Roll Tracking — TraceWeave" },
      { property: "og:description", content: "Search fabric rolls by roll number, RFID EPC, batch or date." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackingPage,
});

export function statusVariant(status: RollStatus | string) {
  switch (status) {
    case "QC Pass":
    case "Dispatched":
      return "default" as const;
    case "QC Fail":
      return "destructive" as const;
    case "Pending QC":
    case "Hold":
    case "Rework":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function TrackingPage() {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [date, setDate] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rolls.filter((r) => {
      if (dept !== "all" && r.currentDepartment !== dept) return false;
      if (date && r.productionDate !== date) return false;
      if (!q) return true;
      return (
        r.rollNumber.toLowerCase().includes(q) ||
        r.rfidEpc.toLowerCase().includes(q) ||
        r.batchNo.toLowerCase().includes(q)
      );
    });
  }, [query, dept, date]);

  return (
    <AppLayout title="Roll Tracking" subtitle="Search by roll number, RFID EPC, batch number or production date">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-64 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Roll number, RFID EPC or batch…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" className="w-44" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll Number</TableHead>
              <TableHead>RFID EPC</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Scan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link
                    to="/passport"
                    search={{ roll: r.rollNumber }}
                    className="font-medium text-primary hover:underline"
                  >
                    {r.rollNumber}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">{r.rfidEpc}</TableCell>
                <TableCell>{r.batchNo}</TableCell>
                <TableCell>{r.currentDepartment}</TableCell>
                <TableCell><Badge variant={statusVariant(r.currentStatus)}>{r.currentStatus}</Badge></TableCell>
                <TableCell>{r.location}</TableCell>
                <TableCell className="text-muted-foreground">{r.lastScanTime}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No rolls match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </AppLayout>
  );
}
