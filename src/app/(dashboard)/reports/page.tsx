import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, Badge, PageHeader, Button } from "@/components/ui/primitives";
import { FileText, Plus, Filter } from "lucide-react";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; programId?: string }>;
}) {
  const { status, programId } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  const where: any = {};
  if (user.role === "RESEARCHER") where.reporterId = user.id;
  if (status) where.status = status;
  if (programId) where.programId = programId;

  if (user.role === "COMPANY") {
    const programs = await prisma.program.findMany({ where: { ownerId: user.id }, select: { id: true } });
    where.programId = programId || { in: programs.map((p) => p.id) };
  }

  const reports = await prisma.report.findMany({
    where,
    include: {
      reporter: { select: { username: true } },
      program: { select: { title: true, slug: true } },
      triager: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusBadge = (s: string) => {
    const map: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
      SUBMITTED: "info", VIEWED: "info", UNDER_REVIEW: "warning", NEEDS_MORE_INFO: "warning",
      VALIDATED: "success", ACCEPTED: "success", REJECTED: "danger", DUPLICATE_CLAIMED: "warning",
      DISPUTED: "danger", PAID: "success", DISCLOSED: "success", CLOSED: "default",
    };
    return map[s] || "default";
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description={user.role === "RESEARCHER" ? "Your submitted reports" : "All reports"}
        action={
          user.role === "RESEARCHER" ? (
            <Link href="/reports/submit">
              <Button><Plus size={16} /> Submit Report</Button>
            </Link>
          ) : undefined
        }
      />

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["ALL", "SUBMITTED", "UNDER_REVIEW", "VALIDATED", "ACCEPTED", "REJECTED", "DUPLICATE_CLAIMED", "DISPUTED", "PAID"].map(
          (s) => (
            <Link
              key={s}
              href={s === "ALL" ? "/reports" : `/reports?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (s === "ALL" && !status) || status === s
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "bg-white/5 text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {s === "ALL" ? "All" : s.replace(/_/g, " ")}
            </Link>
          )
        )}
      </div>

      {reports.length === 0 ? (
        <Card>
          <p className="text-center text-[var(--muted)] py-12">No reports found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r: any) => (
            <Link key={r.id} href={`/reports/${r.id}`}>
              <Card className="hover:border-[var(--accent)]/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm mb-1 truncate">{r.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                      <span>{r.program?.title}</span>
                      {r.reporter && <span>by {r.reporter.username}</span>}
                      {r.triager && <span>triaged by {r.triager.name}</span>}
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant={statusBadge(r.status)}>{r.status.replace(/_/g, " ")}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
