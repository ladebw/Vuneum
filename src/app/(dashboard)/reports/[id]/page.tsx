import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, Badge, PageHeader, Button, TimelineEvent } from "@/components/ui/primitives";
import { AlertTriangle, DollarSign, MessageSquare } from "lucide-react";
import Link from "next/link";
import TriageActions from "./TriageActions";
import CommentForm from "./CommentForm";
import DisputeForm from "./DisputeForm";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, name: true, username: true, avatarUrl: true } },
      triager: { select: { id: true, name: true, username: true } },
      program: { select: { id: true, title: true, slug: true, ownerId: true } },
      evidence: true,
      comments: {
        include: { author: { select: { id: true, name: true, username: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      timeline: {
        include: { user: { select: { id: true, name: true, username: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      myDuplicateClaim: true,
      duplicatesOfMe: true,
      dispute: true,
      payout: true,
    },
  });

  if (!report) {
    return (
      <div>
        <PageHeader title="Report Not Found" />
        <Card><p className="text-center py-8 text-[var(--muted)]">This report does not exist.</p></Card>
      </div>
    );
  }

  // Access control
  const canAccess =
    report.reporterId === user.id ||
    report.triagerId === user.id ||
    report.program.ownerId === user.id ||
    user.role === "ADMIN" ||
    user.role === "TRIAGER";

  if (!canAccess) {
    return (
      <div>
        <PageHeader title="Access Denied" />
        <Card><p className="text-center py-8 text-[var(--muted)]">You do not have access to this report.</p></Card>
      </div>
    );
  }

  const isTriager = user.role === "TRIAGER" || user.role === "ADMIN";
  const isReporter = report.reporterId === user.id;
  const isOwner = report.program.ownerId === user.id;

  const statusBadge = (s: string) => {
    const map: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
      SUBMITTED: "info", VIEWED: "info", UNDER_REVIEW: "warning", NEEDS_MORE_INFO: "warning",
      VALIDATED: "success", ACCEPTED: "success", REJECTED: "danger", DUPLICATE_CLAIMED: "warning",
      DISPUTED: "danger", PAID: "success", DISCLOSED: "success", CLOSED: "default",
    };
    return map[s] || "default";
  };

  const severityColor = (s: string) => {
    const map: Record<string, string> = {
      CRITICAL: "text-red-400", HIGH: "text-orange-400", MEDIUM: "text-yellow-400",
      LOW: "text-blue-400", INFORMATIONAL: "text-gray-400",
    };
    return map[s] || "text-gray-400";
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/reports" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-3 inline-block">
          &larr; Back to Reports
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold">{report.title}</h1>
              <Badge variant={statusBadge(report.status)}>{report.status.replace(/_/g, " ")}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <Link href={`/programs/${report.program.id}`} className="hover:text-[var(--foreground)]">
                {report.program.title}
              </Link>
              <span>&middot;</span>
              <span>by {report.reporter.name || report.reporter.username}</span>
              <span>&middot;</span>
              <span>{new Date(report.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-sm font-medium ${severityColor(report.claimedSeverity)}`}>
              {report.claimedSeverity}
            </span>
            {report.actualSeverity && (
              <span className={`text-sm font-medium ml-2 ${severityColor(report.actualSeverity)}`}>
                &rarr; {report.actualSeverity}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <h2 className="font-semibold mb-4">Vulnerability Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Target Asset</p>
                <code className="text-sm">{report.targetAsset}</code>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Vulnerability Type</p>
                <p className="text-sm">{report.vulnerabilityType}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Impact</p>
                <p className="text-sm whitespace-pre-wrap">{report.impact}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Steps to Reproduce</p>
                <pre className="text-sm whitespace-pre-wrap bg-[var(--background)] p-4 rounded-lg border border-[var(--border)]">
                  {report.stepsToReproduce}
                </pre>
              </div>
              {report.suggestedFix && (
                <div>
                  <p className="text-xs text-[var(--muted)] mb-1">Suggested Fix</p>
                  <p className="text-sm whitespace-pre-wrap">{report.suggestedFix}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Evidence */}
          {report.evidence.length > 0 && (
            <Card>
              <h2 className="font-semibold mb-4">Evidence ({report.evidence.length})</h2>
              <div className="space-y-2">
                {report.evidence.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10">{ev.type}</span>
                    <span className="text-sm flex-1">{ev.title || "Untitled"}</span>
                    <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline">
                      View
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <h2 className="font-semibold mb-2">Timeline</h2>
            <div className="relative timeline-line">
              {report.timeline.map((event: any) => (
                <TimelineEvent key={event.id} event={event} />
              ))}
            </div>
          </Card>

          {/* Comments */}
          <Card>
            <h2 className="font-semibold mb-4">Comments ({report.comments.length})</h2>
            {report.comments.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-4">No comments yet.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {report.comments.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{c.author.name || c.author.username}</span>
                      <Badge variant="default">{c.author.role}</Badge>
                      {c.isPrivate && <span className="text-xs text-[var(--warning)]">Private</span>}
                      <span className="text-xs text-[var(--muted)]">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
            <CommentForm reportId={report.id} />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Triage Actions */}
          {isTriager && (
            <Card>
              <h2 className="font-semibold mb-4">Triage Actions</h2>
              <TriageActions reportId={report.id} currentStatus={report.status} />
            </Card>
          )}

          {/* Duplicate Info */}
          {report.myDuplicateClaim && (
            <Card className="border-orange-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-orange-400" />
                <h3 className="font-semibold text-sm">Marked as Duplicate</h3>
              </div>
              <p className="text-xs text-[var(--muted)] mb-2">
                This report was marked as a duplicate of report{" "}
                <Link href={`/reports/${report.myDuplicateClaim.originalReportId}`} className="text-[var(--accent)] hover:underline">
                  #{report.myDuplicateClaim.originalReportId.slice(0, 8)}
                </Link>
              </p>
              <div className="text-xs text-[var(--muted)] space-y-1">
                <p><strong>Root cause:</strong> {report.myDuplicateClaim.rootCauseExplanation}</p>
                <p><strong>Triager reasoning:</strong> {report.myDuplicateClaim.triagerReasoning}</p>
              </div>
            </Card>
          )}

          {/* Payout Info */}
          {report.payout && (
            <Card className="border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-green-400" />
                <h3 className="font-semibold text-sm">Payout</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Reward:</span>
                  <span className="font-medium">${report.payout.rewardAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Platform fee ({report.payout.platformFeePct}%):</span>
                  <span>-${report.payout.platformFee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--border)] pt-1">
                  <span className="font-medium">Net:</span>
                  <span className="font-medium text-green-400">${report.payout.researcherNet?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Status:</span>
                  <Badge variant={report.payout.status === "PAID" ? "success" : "warning"}>
                    {report.payout.status}
                  </Badge>
                </div>
                {report.payout.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Paid on:</span>
                    <span>{new Date(report.payout.paymentDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Dispute */}
          {report.dispute && (
            <Card className={report.dispute.status === "RESOLVED" ? "border-green-500/30" : "border-red-500/30"}>
              <h3 className="font-semibold text-sm mb-2">
                Dispute: {report.dispute.disputeType.replace(/_/g, " ")}
              </h3>
              <Badge variant={report.dispute.status === "RESOLVED" ? "success" : "warning"}>
                {report.dispute.status}
              </Badge>
              <div className="mt-2 space-y-2 text-xs">
                <p><span className="text-[var(--muted)]">Argument:</span> {report.dispute.researcherArgument}</p>
                {report.dispute.triagerResponse && (
                  <p><span className="text-[var(--muted)]">Response:</span> {report.dispute.triagerResponse}</p>
                )}
                {report.dispute.finalDecision && (
                  <p><span className="text-[var(--muted)]">Decision:</span> <strong>{report.dispute.finalDecision}</strong></p>
                )}
              </div>
            </Card>
          )}

          {/* Dispute Form */}
          {isReporter && !report.dispute && ["DUPLICATE_CLAIMED", "ACCEPTED", "REJECTED", "VALIDATED"].includes(report.status) && (
            <DisputeForm reportId={report.id} currentStatus={report.status} />
          )}

          {/* Meta Info */}
          <Card>
            <h3 className="font-semibold text-sm mb-3">Report Info</h3>
            <div className="space-y-2 text-xs text-[var(--muted)]">
              <div className="flex justify-between">
                <span>Report ID</span>
                <code className="text-[var(--foreground)]">{report.id.slice(0, 8)}...</code>
              </div>
              <div className="flex justify-between">
                <span>Submitted</span>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span>{new Date(report.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Disclosure</span>
                <span>{report.disclosurePref}</span>
              </div>
              {report.triager && (
                <div className="flex justify-between">
                  <span>Triager</span>
                  <span>{report.triager.name || report.triager.username}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
