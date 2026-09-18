import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { auditLogs } from "@/lib/mock-data";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs — TraceWeave" },
      { name: "description", content: "Security audit trail of logins, roll creation, movements, status changes and RFID replacements." },
      { property: "og:title", content: "Audit Logs — TraceWeave" },
      { property: "og:description", content: "Security audit trail for the traceability system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});

const actions = ["Login", "Logout", "Roll Creation", "Roll Movement", "Status Change", "RFID Replacement", "User Management"] as const;

function actionVariant(action: string) {
  if (action === "RFID Replacement" || action === "User Management") return "destructive" as const;
  if (action === "Status Change") return "secondary" as const;
  return "outline" as const;
}

function AuditPage() {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auditLogs.filter((l) => {
      if (action !== "all" && l.action !== action) return false;
      if (!q) return true;
      return l.user.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q) || l.deviceId.toLowerCase().includes(q);
    });
  }, [query, action]);

  return (
    <AppLayout title="Audit Logs" subtitle="Every login, movement, status change and tag replacement">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search user, detail or device…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      <Card className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead>Device</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">{l.timestamp}</TableCell>
                <TableCell className="font-medium">{l.user}</TableCell>
                <TableCell><Badge variant={actionVariant(l.action)}>{l.action}</Badge></TableCell>
                <TableCell>{l.detail}</TableCell>
                <TableCell className="font-mono text-xs">{l.deviceId}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No audit entries match.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </AppLayout>
  );
}
