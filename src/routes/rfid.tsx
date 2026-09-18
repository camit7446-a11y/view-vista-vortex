import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Replace, Search } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { rfidTags, rolls, type TagStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/rfid")({
  head: () => ({
    meta: [
      { title: "RFID Management — TraceWeave" },
      { name: "description", content: "RFID tag registration, inventory, status tracking and authorized tag replacement with history preservation." },
      { property: "og:title", content: "RFID Management — TraceWeave" },
      { property: "og:description", content: "RFID tag registration, inventory and replacement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RfidPage,
});

function tagVariant(status: TagStatus) {
  switch (status) {
    case "Active": return "default" as const;
    case "Damaged": return "destructive" as const;
    case "Replaced": return "secondary" as const;
    default: return "outline" as const;
  }
}

function RfidPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [oldTag, setOldTag] = useState("");
  const [newTag, setNewTag] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rfidTags.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!q) return true;
      const roll = rolls.find((r) => r.id === t.assignedRollId);
      return t.epc.toLowerCase().includes(q) || (roll?.rollNumber.toLowerCase().includes(q) ?? false);
    });
  }, [query, statusFilter]);

  const replaceTag = () => {
    const old = rfidTags.find((t) => t.epc.toLowerCase().replace(/\s/g, "") === oldTag.toLowerCase().replace(/\s/g, ""));
    if (!old) {
      toast.error("Old tag not found in registry.");
      return;
    }
    if (!newTag.trim()) {
      toast.error("Scan or enter the new tag EPC.");
      return;
    }
    toast.success(`Tag re-mapped for roll ${rolls.find((r) => r.id === old.assignedRollId)?.rollNumber ?? "—"}. Movement history preserved.`);
    setOpen(false);
    setOldTag("");
    setNewTag("");
  };

  const counts = {
    Active: rfidTags.filter((t) => t.status === "Active").length,
    Damaged: rfidTags.filter((t) => t.status === "Damaged").length,
    Replaced: rfidTags.filter((t) => t.status === "Replaced").length,
    Inactive: rfidTags.filter((t) => t.status === "Inactive").length,
  };

  return (
    <AppLayout title="RFID Management" subtitle="Tag registry, inventory and authorized replacement">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {(Object.keys(counts) as TagStatus[]).map((s) => (
          <Card key={s}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground">{s} tags</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{counts[s]}</p>
              </div>
              <Badge variant={tagVariant(s)}>{s}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by EPC or roll number…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Damaged">Damaged</SelectItem>
              <SelectItem value="Replaced">Replaced</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Replace className="mr-2 h-4 w-4" />Replace Tag</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tag replacement — authorized users only</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Old tag EPC</Label>
                  <Input className="font-mono" value={oldTag} onChange={(e) => setOldTag(e.target.value)} placeholder="Scan old tag" />
                </div>
                <div className="space-y-1.5">
                  <Label>New tag EPC</Label>
                  <Input className="font-mono" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Scan new tag" />
                </div>
                <p className="text-xs text-muted-foreground">The old tag is marked Replaced and the full roll history is preserved under the new EPC.</p>
                <Button className="w-full" onClick={replaceTag}>Re-map RFID</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-sm">Tag Inventory</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>EPC</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Roll</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => {
              const roll = rolls.find((r) => r.id === t.assignedRollId);
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.epc}</TableCell>
                  <TableCell><Badge variant={tagVariant(t.status)}>{t.status}</Badge></TableCell>
                  <TableCell>{roll ? roll.rollNumber : <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                  <TableCell className="text-muted-foreground">{t.registeredDate}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </AppLayout>
  );
}
