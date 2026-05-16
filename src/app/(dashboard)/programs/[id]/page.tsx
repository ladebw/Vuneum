import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, Badge, PageHeader, Button } from "@/components/ui/primitives";
import { Globe, Lock, FileText, AlertTriangle, DollarSign } from "lucide-react";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, username: true } },
      organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
      scopeAssets: true,
      rewardTiers: true,
      transparency: true,
      reports: {
        include: { reporter: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!program) {
    return (
      <div>
        <PageHeader title="Program Not Found" />
        <Card><p className="text-center py-8 text-[var(--muted)]">This program does not exist.</p></Card>
      </div>
    );
  }

  const severityColor = (s: string) => {
    const map: Record<string, string> = {
      CRITICAL: "text-red-400", HIGH: "text-orange-400", MEDIUM: "text-yellow-400",
      LOW: "text-blue-400", INFORMATIONAL: "text-gray-400", NONE: "text-gray-400",
    };
    return map[s] || "text-gray-400";
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{program.title}</h1>
            <Badge variant={program.status === "PUBLIC" ? "success" : "warning"}>
              {program.status}
            </Badge>
            <Badge variant="info">{program.visibility}</Badge>
          </div>
          <p className="text-sm text-[var(--muted)]">
            by {program.organization?.name || program.owner?.name}
          </p>
        </div>
        {user.role === "RESEARCHER" && (
          <Link href={`/reports/submit?programId=${program.id}`}>
            <Button size="lg">
              <FileText size={18} /> Submit Report
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      {program.transparency && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <p className="text-2xl font-bold text-[var(--accent)]">{program.transparency.validReportCount}</p>
            <p className="text-xs text-[var(--muted)]">Valid Reports</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-400">${program.transparency.totalPaid?.toLocaleString()}</p>
            <p className="text-xs text-[var(--muted)]">Total Paid</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{program.transparency.duplicateRate?.toFixed(1)}%</p>
            <p className="text-xs text-[var(--muted)]">Duplicate Rate</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-red-400">{program.transparency.rejectionRate?.toFixed(1)}%</p>
            <p className="text-xs text-[var(--muted)]">Rejection Rate</p>
          </Card>
        </div>
      )}

      {/* Description */}
      <Card className="mb-6">
        <h2 className="font-semibold mb-2">About</h2>
        <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{program.description}</p>
      </Card>

      {/* Reward Tiers */}
      {program.rewardTiers.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold mb-4">Reward Table</h2>
          <div className="space-y-2">
            {program.rewardTiers.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className={`font-medium text-sm ${severityColor(t.severity)}`}>{t.severity}</span>
                <span className="text-sm">${t.minAmount?.toLocaleString()} – ${t.maxAmount?.toLocaleString()}</span>
                <span className="text-xs text-[var(--muted)]">{t.description}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Scope */}
      <Card className="mb-6">
        <h2 className="font-semibold mb-4">Scope</h2>
        <div className="grid gap-2">
          {program.scopeAssets.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg">
              {a.inScope ? (
                <Globe size={16} className="text-green-400 flex-shrink-0" />
              ) : (
                <Lock size={16} className="text-red-400 flex-shrink-0" />
              )}
              <div>
                <code className="text-sm">{a.identifier}</code>
                <span className="text-xs text-[var(--muted)] ml-2">({a.assetType})</span>
              </div>
              {!a.inScope && <Badge variant="danger">Out of Scope</Badge>}
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Reports */}
      {program.reports.length > 0 && (
        <Card>
          <h2 className="font-semibold mb-4">Recent Reports</h2>
          <div className="space-y-2">
            {program.reports.map((r: any) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-xs text-[var(--muted)]">by {r.reporter.username}</p>
                </div>
                <Badge>{r.status.replace(/_/g, " ")}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
