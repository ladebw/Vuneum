import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, Badge, PageHeader } from "@/components/ui/primitives";
import { DollarSign } from "lucide-react";

export default async function PayoutsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  const where: any = {};
  if (user.role === "RESEARCHER") where.userId = user.id;

  const payouts = await prisma.payout.findMany({
    where,
    include: {
      report: { select: { id: true, title: true } },
      user: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPaid = await prisma.payout.aggregate({
    where: { ...where, status: "PAID" },
    _sum: { researcherNet: true, rewardAmount: true, platformFee: true },
  });

  return (
    <div>
      <PageHeader title="Payouts" description="Track bounty payouts" />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-400">${totalPaid._sum.researcherNet?.toLocaleString() || 0}</p>
          <p className="text-xs text-[var(--muted)]">Net Paid to Researchers</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold">${totalPaid._sum.rewardAmount?.toLocaleString() || 0}</p>
          <p className="text-xs text-[var(--muted)]">Total Rewards</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-[var(--muted)]">${totalPaid._sum.platformFee?.toLocaleString() || 0}</p>
          <p className="text-xs text-[var(--muted)]">Platform Fees</p>
        </Card>
      </div>

      {payouts.length === 0 ? (
        <Card><p className="text-center text-[var(--muted)] py-12">No payouts yet.</p></Card>
      ) : (
        <div className="space-y-3">
          {payouts.map((p: any) => (
            <Link key={p.id} href={`/reports/${p.reportId}`}>
              <Card className="hover:border-[var(--accent)]/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign size={18} className="text-green-400" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-md">{p.report?.title}</p>
                      <p className="text-xs text-[var(--muted)]">
                        Researcher: ${p.researcherNet?.toLocaleString()} net
                        {p.user && ` · ${p.user.username}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">${p.rewardAmount?.toLocaleString()}</span>
                    <Badge variant={p.status === "PAID" ? "success" : p.status === "PENDING" ? "warning" : "default"}>
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
