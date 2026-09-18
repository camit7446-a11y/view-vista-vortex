import { createFileRoute } from "@tanstack/react-router";
import { DoorOpen, TriangleAlert } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { gateEvents, gates } from "@/lib/mock-data";

export const Route = createFileRoute("/gates")({
  head: () => ({
    meta: [
      { title: "RFID Gates — TraceWeave" },
      { name: "description", content: "RFID gate configuration, reader status and real-time automatic movement events between departments." },
      { property: "og:title", content: "RFID Gates — TraceWeave" },
      { property: "og:description", content: "Gate configuration and real-time RFID movement events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GatesPage,
});

function GatesPage() {
  return (
    <AppLayout title="RFID Gates" subtitle="Automatic movement capture without manual scanning">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gates.map((g) => (
          <Card key={g.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-sm">
                <DoorOpen className="h-4 w-4 text-muted-foreground" />
                {g.name}
              </CardTitle>
              <Badge variant={g.status === "Online" ? "default" : "destructive"}>{g.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                ["Gate ID", g.id],
                ["Department", g.department],
                ["Direction", g.direction],
                ["Reader IP", g.readerIp],
                ["Read zone", g.readZone],
                ["Sensitivity", `${g.sensitivity} dBm`],
                ["De-dupe interval", `${g.dedupeIntervalSec}s`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-sm">Live Gate Events</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Gate</TableHead>
              <TableHead>EPC</TableHead>
              <TableHead>Roll</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Signal</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gateEvents.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">{e.timestamp}</TableCell>
                <TableCell className="font-mono text-xs">{e.gate}</TableCell>
                <TableCell className="font-mono text-xs">{e.epc}</TableCell>
                <TableCell>{e.rollNumber ?? <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>{e.direction}</TableCell>
                <TableCell>{e.signalStrength} dBm</TableCell>
                <TableCell>
                  {e.result === "Unknown Tag Alert" ? (
                    <Badge variant="destructive" className="gap-1"><TriangleAlert className="h-3 w-3" />{e.result}</Badge>
                  ) : (
                    <Badge variant={e.result === "Movement Created" ? "default" : "secondary"}>{e.result}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppLayout>
  );
}
