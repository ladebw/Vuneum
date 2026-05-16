import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, Badge, PageHeader, Button } from "@/components/ui/primitives";
import { Shield, Plus } from "lucide-react";

export default async function ProgramsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  const programs = await prisma.program.findMany({
    include: {
      owner: { select: { name: true } },
      organization: { select: { name: true, slug: true } },
      _count: { select: { reports: true } },
      transparency: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Programs"
        description="Browse bounty programs"
        action={
          (user.role === "COMPANY" || user.role === "ADMIN") ? (
            <Link href="/programs/new">
              <Button>
                <Plus size={16} /> New Program
              </Button>
            </Link>
          ) : undefined
        }
      />

      {programs.length === 0 ? (
        <Card>
          <p className="text-center text-[var(--muted)] py-12">
            No programs yet.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {programs.map((p: any) => (
            <Link key={p.id} href={`/programs/${p.id}`}>
              <Card className="hover:border-[var(--accent)]/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                      <Shield size={20} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{p.title}</h3>
                      <p className="text-sm text-[var(--muted)]">
                        {p.organization?.name || p.owner?.name}
                        {p.transparency && ` · $${p.transparency.totalPaid?.toLocaleString()} paid`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--muted)]">{p._count.reports} reports</span>
                    <Badge variant={p.status === "PUBLIC" ? "success" : p.status === "PRIVATE" ? "warning" : "default"}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
