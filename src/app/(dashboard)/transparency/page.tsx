import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Clock, FileText, DollarSign, AlertTriangle, BarChart3 } from "lucide-react";

export default async function TransparencyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const metrics = await prisma.transparencyMetric.findMany({
    include: { program: { select: { id: true, title: true, slug: true, status: true } } },
  });

  return (
    <div>
      <PageHeader title="Transparency" description="Public metrics for all programs" />

      {metrics.length === 0 ? (
        <Card><p className="text-center text-[var(--muted)] py-12">No metrics available.</p></Card>
      ) : (
        <div className="space-y-6">
          {metrics.map((m: any) => (
            <Card key={m.id}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{m.program?.title}</h3>
                <span className="text-xs text-[var(--muted)]">{m.program?.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <Clock size={18} className="mx-auto mb-1 text-[var(--muted)]" />
                  <p className="text-lg font-bold">{m.avgFirstResponseHours?.toFixed(1)}h</p>
                  <p className="text-xs text-[var(--muted)]">Avg First Response</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <Clock size={18} className="mx-auto mb-1 text-[var(--muted)]" />
                  <p className="text-lg font-bold">{m.avgTriageHours?.toFixed(1)}h</p>
                  <p className="text-xs text-[var(--muted)]">Avg Triage Time</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <FileText size={18} className="mx-auto mb-1 text-blue-400" />
                  <p className="text-lg font-bold">{m.validReportCount}/{m.totalReportCount}</p>
                  <p className="text-xs text-[var(--muted)]">Valid / Total</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <DollarSign size={18} className="mx-auto mb-1 text-green-400" />
                  <p className="text-lg font-bold">${m.totalPaid?.toLocaleString()}</p>
                  <p className="text-xs text-[var(--muted)]">Total Paid</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 rounded-lg bg-yellow-500/5">
                  <p className="text-lg font-bold text-yellow-400">{m.duplicateRate?.toFixed(1)}%</p>
                  <p className="text-xs text-[var(--muted)]">Duplicate Rate</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-500/5">
                  <p className="text-lg font-bold text-red-400">{m.rejectionRate?.toFixed(1)}%</p>
                  <p className="text-xs text-[var(--muted)]">Rejection Rate</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-500/5">
                  <p className="text-lg font-bold text-orange-400">{m.disputeReopenRate?.toFixed(1)}%</p>
                  <p className="text-xs text-[var(--muted)]">Dispute Reopen Rate</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
