import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Pencil, Plus } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { departments as seedDepartments, rolls, type Department } from "@/lib/mock-data";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departments — TraceWeave" },
      { name: "description", content: "Manage production departments and their sequence order in the fabric roll workflow." },
      { property: "og:title", content: "Departments — TraceWeave" },
      { property: "og:description", content: "Manage production departments and workflow sequence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(seedDepartments);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const createDept = () => {
    if (!name.trim() || !code.trim()) {
      toast.error("Department name and code are required.");
      return;
    }
    setDepartments((prev) => [
      ...prev,
      { id: Math.max(...prev.map((d) => d.id)) + 1, name: name.trim(), code: code.trim().toUpperCase(), sequenceNo: prev.length + 1 },
    ]);
    toast.success(`Department ${name.trim()} added to the workflow.`);
    setOpen(false);
    setName("");
    setCode("");
  };

  const sorted = [...departments].sort((a, b) => a.sequenceNo - b.sequenceNo);

  return (
    <AppLayout title="Department Management" subtitle="Workflow sequence drives allowed roll movements">
      {/* workflow strip */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          {sorted.map((d, i) => (
            <span key={d.id} className="flex items-center gap-2">
              <span className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground">
                {d.sequenceNo}. {d.name}
              </span>
              {i < sorted.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </span>
          ))}
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Department</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add department</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Department name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dyeing" />
              </div>
              <div className="space-y-1.5">
                <Label>Department code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. DYG" maxLength={4} />
              </div>
              <p className="text-xs text-muted-foreground">New departments are appended at the end of the workflow sequence.</p>
              <Button className="w-full" onClick={createDept}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-sm">Departments</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Seq.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Rolls in Dept.</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((d) => (
              <TableRow key={d.id}>
                <TableCell><Badge variant="secondary">{d.sequenceNo}</Badge></TableCell>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="font-mono text-xs">{d.code}</TableCell>
                <TableCell>{rolls.filter((r) => r.currentDepartment === d.name).length}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => toast.info("Edit department — demo action.")}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppLayout>
  );
}
