import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, Badge, PageHeader } from "@/components/ui/primitives";
import { AlertTriangle } from "lucide-react";

export default async function DisputesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  const where: any = {};
  if (user.role === "RESEARCHER") where.researcherId = user.id;

  const disputes = await prisma.dispute.findMany({
    where,
    include: {
      report: { select: { id: true, title: true, status: true } },
      researcher: { select: { username: true } },
      decidedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Disputes" description="Track and manage disputes" />
      {disputes.length === 0 ? (
        <Card><p className="text-center text-[var(--muted)] py-12">No disputes.</p></Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((d: any) => (
            <Link key={d.id} href={`/reports/${d.reportId}`}>
              <Card className="hover:border-[var(--accent)]/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={18} className={d.status === "RESOLVED" ? "text-green-400" : "text-red-400"} />
                    <div>
                      <p className="text-sm font-medium">{d.report?.title}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {d.disputeType.replace(/_/g, " ")}
                        {d.researcher && ` · by ${d.researcher.username}`}
                        {d.decidedBy && ` · resolved by ${d.decidedBy.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">{new Date(d.createdAt).toLocaleDateString()}</span>
                    <Badge variant={d.status === "RESOLVED" ? "success" : "warning"}>{d.status}</Badge>
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
