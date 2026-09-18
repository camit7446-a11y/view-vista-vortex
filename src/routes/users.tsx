import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Plus, UserX, UserCheck, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { users as seedUsers, type Role, type User } from "@/lib/mock-data";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "User Management — TraceWeave" },
      { name: "description", content: "Create, edit and disable users, reset passwords and manage Admin, Supervisor, Operator and Management roles." },
      { property: "og:title", content: "User Management — TraceWeave" },
      { property: "og:description", content: "Manage users and role-based access for the traceability system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsersPage,
});

const roles: Role[] = ["Admin", "Supervisor", "Operator", "Management"];

function UsersPage() {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("Operator");

  const createUser = () => {
    if (!fullName.trim() || !username.trim()) {
      toast.error("Full name and username are required.");
      return;
    }
    if (users.some((u) => u.username === username.trim())) {
      toast.error("Username already exists.");
      return;
    }
    setUsers((prev) => [
      ...prev,
      {
        id: Math.max(...prev.map((u) => u.id)) + 1,
        username: username.trim(),
        fullName: fullName.trim(),
        role,
        status: "Active",
        createdDate: "2026-09-18",
        lastLogin: "—",
      },
    ]);
    toast.success(`User ${username.trim()} created with role ${role}.`);
    setOpen(false);
    setFullName("");
    setUsername("");
    setRole("Operator");
  };

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "Active" ? "Disabled" : "Active" } : u)),
    );
    toast.success("User status updated.");
  };

  return (
    <AppLayout title="User Management" subtitle="Role-based access for web and handheld apps">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create user</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Anita Rao" />
              </div>
              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. a.rao" />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={createUser}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.fullName}</TableCell>
                <TableCell className="font-mono text-xs">{u.username}</TableCell>
                <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                <TableCell>
                  <Badge variant={u.status === "Active" ? "default" : "destructive"}>{u.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.createdDate}</TableCell>
                <TableCell className="text-muted-foreground">{u.lastLogin}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => toast.info("Edit user — demo action.")}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Reset password" onClick={() => toast.success(`Password reset link generated for ${u.username}.`)}>
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title={u.status === "Active" ? "Disable" : "Enable"} onClick={() => toggleStatus(u.id)}>
                      {u.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppLayout>
  );
}
