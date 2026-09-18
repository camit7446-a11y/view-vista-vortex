import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Search, ScanLine } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { movementsForRoll, rolls } from "@/lib/mock-data";
import { statusVariant } from "./tracking";

const searchSchema = z.object({
  roll: z.string().optional(),
});

export const Route = createFileRoute("/passport")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Roll Passport — TraceWeave" },
      { name: "description", content: "Complete traceability passport for a fabric roll: master data, current status and full movement timeline from weaving to dispatch." },
      { property: "og:title", content: "Roll Passport — TraceWeave" },
      { property: "og:description", content: "Complete traceability timeline for a fabric roll." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PassportPage,
});

function PassportPage() {
  const { roll: rollParam } = Route.useSearch();
  const [query, setQuery] = useState(rollParam ?? "");

  const roll = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rolls[10]!;
    return (
      rolls.find(
        (r) =>
          r.rollNumber.toLowerCase() === q ||
          r.rfidEpc.toLowerCase().replace(/\s/g, "") === q.replace(/\s/g, "") ||
          r.batchNo.toLowerCase() === q,
      ) ?? rolls.find((r) => r.rollNumber.toLowerCase().includes(q)) ?? null
    );
  }, [query]);

  const history = roll ? movementsForRoll(roll.id) : [];

  return (
    <AppLayout title="Roll Passport" subtitle="Full traceability from creation to dispatch">
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Enter roll number, RFID EPC or batch (e.g. FR-26-1011)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {!roll ? (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
            <ScanLine className="h-8 w-8" />
            <p>No roll found for “{query}”.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-sm">Roll Master</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
                  {[
                    ["Roll Number", roll.rollNumber],
                    ["RFID EPC", roll.rfidEpc],
                    ["Batch", roll.batchNo],
                    ["GSM", String(roll.gsm)],
                    ["Width", `${roll.width} cm`],
                    ["Length", `${roll.length} m`],
                    ["Weight", `${roll.weight} kg`],
                    ["Production Date", roll.productionDate],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                      <dd className={`mt-1 text-sm font-medium text-foreground ${k === "RFID EPC" ? "font-mono text-xs" : ""}`}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Current Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{roll.currentDepartment}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusVariant(roll.currentStatus)}>{roll.currentStatus}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{roll.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Operator</span>
                  <span className="font-medium">{roll.operator}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last scan</span>
                  <span className="font-medium">{roll.lastScanTime}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader><CardTitle className="text-sm">Traceability Timeline</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Device / Gate</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{m.timestamp}</TableCell>
                      <TableCell>{m.sourceDept}</TableCell>
                      <TableCell className="font-medium">{m.destinationDept}</TableCell>
                      <TableCell>{m.user}</TableCell>
                      <TableCell><Badge variant={statusVariant(m.status)}>{m.status}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{m.viaGate ?? m.device}</TableCell>
                      <TableCell className="text-muted-foreground">{m.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </AppLayout>
  );
}
