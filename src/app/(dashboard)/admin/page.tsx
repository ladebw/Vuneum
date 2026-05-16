import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, PageHeader, Badge } from "@/components/ui/primitives";
import { Users, Shield, FileText, AlertTriangle } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as any;
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [users, programs, reports, disputes] = await Promise.all([
    prisma.user.findMany({ select: { id: true, email: true, username: true, name: true, role: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.program.count(),
    prisma.report.count(),
    prisma.dispute.count({ where: { status: "OPEN" } }),
  ]);

  const usersByRole = {
    RESEARCHER: users.filter((u) => u.role === "RESEARCHER").length,
    COMPANY: users.filter((u) => u.role === "COMPANY").length,
    TRIAGER: users.filter((u) => u.role === "TRIAGER").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <div>
      <PageHeader title="Admin Panel" description="Platform management" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <Users size={20} className="mx-auto mb-1 text-[var(--accent)]" />
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-xs text-[var(--muted)]">Total Users</p>
        </Card>
        <Card className="text-center">
          <Shield size={20} className="mx-auto mb-1 text-green-400" />
          <p className="text-2xl font-bold">{programs}</p>
          <p className="text-xs text-[var(--muted)]">Programs</p>
        </Card>
        <Card className="text-center">
          <FileText size={20} className="mx-auto mb-1 text-blue-400" />
          <p className="text-2xl font-bold">{reports}</p>
          <p className="text-xs text-[var(--muted)]">Reports</p>
        </Card>
        <Card className="text-center">
          <AlertTriangle size={20} className="mx-auto mb-1 text-red-400" />
          <p className="text-2xl font-bold">{disputes}</p>
          <p className="text-xs text-[var(--muted)]">Open Disputes</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold mb-4">Users ({users.length})</h2>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <p className="text-sm font-medium">{u.name || u.username}</p>
                <p className="text-xs text-[var(--muted)]">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">{new Date(u.createdAt).toLocaleDateString()}</span>
                <Badge variant={u.role === "ADMIN" ? "danger" : u.role === "TRIAGER" ? "warning" : u.role === "COMPANY" ? "info" : "success"}>
                  {u.role}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
