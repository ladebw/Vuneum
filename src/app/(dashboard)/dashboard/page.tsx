import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, Badge, PageHeader } from "@/components/ui/primitives";
import { FileText, Shield, AlertTriangle, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  let stats: any = {};
  let recentReports: any[] = [];

  if (user.role === "RESEARCHER") {
    const [total, accepted, rejected, disputed, paid] = await Promise.all([
      prisma.report.count({ where: { reporterId: user.id } }),
      prisma.report.count({ where: { reporterId: user.id, status: "ACCEPTED" } }),
      prisma.report.count({ where: { reporterId: user.id, status: "REJECTED" } }),
      prisma.report.count({ where: { reporterId: user.id, status: "DISPUTED" } }),
      prisma.report.count({ where: { reporterId: user.id, status: "PAID" } }),
    ]);

    const payouts = await prisma.payout.aggregate({
      where: { userId: user.id, status: "PAID" },
      _sum: { researcherNet: true },
    });

    stats = { total, accepted, rejected, disputed, paid, totalEarnings: payouts._sum.researcherNet || 0 };

    recentReports = await prisma.report.findMany({
      where: { reporterId: user.id },
      include: { program: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } else if (user.role === "COMPANY") {
    const programs = await prisma.program.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    const programIds = programs.map((p) => p.id);

    const [programsCount, totalReports, openReports, totalPaid] = await Promise.all([
      programs.length,
      prisma.report.count({ where: { programId: { in: programIds } } }),
      prisma.report.count({ where: { programId: { in: programIds }, status: { notIn: ["CLOSED", "REJECTED", "PAID"] } } }),
      prisma.payout.aggregate({ where: { report: { programId: { in: programIds } } }, _sum: { rewardAmount: true } }),
    ]);

    stats = { programsCount, totalReports, openReports, totalPaid: totalPaid._sum.rewardAmount || 0 };

    recentReports = await prisma.report.findMany({
      where: { programId: { in: programIds } },
      include: { reporter: { select: { username: true } }, program: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } else if (user.role === "TRIAGER" || user.role === "ADMIN") {
    const [total, open, validated, disputed] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: { in: ["SUBMITTED", "VIEWED", "UNDER_REVIEW"] } } }),
      prisma.report.count({ where: { status: "VALIDATED" } }),
      prisma.dispute.count({ where: { status: "OPEN" } }),
    ]);

    stats = { total, open, validated, disputed };

    recentReports = await prisma.report.findMany({
      where: { status: { in: ["SUBMITTED", "VIEWED"] } },
      include: { reporter: { select: { username: true } }, program: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }

  const statusBadge = (status: string) => {
    const map: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
      SUBMITTED: "info",
      VIEWED: "info",
      UNDER_REVIEW: "warning",
      VALIDATED: "success",
      ACCEPTED: "success",
      REJECTED: "danger",
      DUPLICATE_CLAIMED: "warning",
      DISPUTED: "danger",
      PAID: "success",
      CLOSED: "default",
    };
    return map[status] || "default";
  };

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back, ${user.name || user.username}`} />

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {user.role === "RESEARCHER" && (
          <>
            <Card>
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-[var(--accent)]" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-[var(--muted)]">Total Reports</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                  <p className="text-xs text-[var(--muted)]">Accepted</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold">${stats.totalEarnings?.toLocaleString() || 0}</p>
                  <p className="text-xs text-[var(--muted)]">Total Earned</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.disputed || 0}</p>
                  <p className="text-xs text-[var(--muted)]">Disputed</p>
                </div>
              </div>
            </Card>
          </>
        )}

        {user.role === "COMPANY" && (
          <>
            <Card>
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-[var(--accent)]" />
                <div>
                  <p className="text-2xl font-bold">{stats.programsCount}</p>
                  <p className="text-xs text-[var(--muted)]">Programs</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                  <p className="text-xs text-[var(--muted)]">Reports</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.openReports}</p>
                  <p className="text-xs text-[var(--muted)]">Open</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-green-400" />
                <div>
                  <p className="text-2xl font-bold">${stats.totalPaid?.toLocaleString() || 0}</p>
                  <p className="text-xs text-[var(--muted)]">Total Paid</p>
                </div>
              </div>
            </Card>
          </>
        )}

        {(user.role === "TRIAGER" || user.role === "ADMIN") && (
          <>
            <Card>
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-[var(--muted)]">Total Reports</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.open}</p>
                  <p className="text-xs text-[var(--muted)]">Awaiting Triage</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.validated}</p>
                  <p className="text-xs text-[var(--muted)]">Validated</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.disputed}</p>
                  <p className="text-xs text-[var(--muted)]">Open Disputes</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Recent reports */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Reports</h2>
          <Link href="/reports" className="text-sm text-[var(--accent)] hover:underline">
            View all
          </Link>
        </div>
        {recentReports.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-8 text-center">No reports yet.</p>
        ) : (
          <div className="space-y-2">
            {recentReports.map((r: any) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {r.program?.title}
                    {r.reporter && ` · by ${r.reporter.username}`}
                  </p>
                </div>
                <Badge variant={statusBadge(r.status)}>{r.status.replace(/_/g, " ")}</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
