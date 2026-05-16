import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { disputeResponseSchema } from "@/lib/validations";

// ─── PATCH /api/disputes/[id] — resolve/respond to dispute ──

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, user } = await requireRole(req, "TRIAGER", "ADMIN");
  if (error) return error;

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: { report: true },
  });
  if (!dispute) return apiError("Dispute not found", 404);

  const body = await req.json();
  const parsed = disputeResponseSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Validation failed: " + JSON.stringify(parsed.error.flatten()), 400);
  }

  const updated = await prisma.dispute.update({
    where: { id },
    data: {
      triagerResponse: parsed.data.triagerResponse,
      finalDecision: parsed.data.finalDecision,
      decidedById: user.id,
      isPublic: parsed.data.isPublic,
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  });

  // Update report status based on decision
  const decisionLower = parsed.data.finalDecision.toLowerCase();
  let newReportStatus = dispute.report.status;
  if (decisionLower.includes("overrule") || decisionLower.includes("accept")) {
    newReportStatus = "ACCEPTED";
  } else if (decisionLower.includes("uphold") || decisionLower.includes("reject")) {
    newReportStatus = "REJECTED";
  }

  await prisma.report.update({
    where: { id: dispute.reportId },
    data: { status: newReportStatus },
  });

  // Timeline event
  await prisma.reportTimelineEvent.create({
    data: {
      reportId: dispute.reportId,
      userId: user.id,
      eventType: "DISPUTE_RESOLVED",
      oldValue: JSON.stringify({ status: dispute.report.status, disputeStatus: dispute.status }),
      newValue: JSON.stringify({ status: newReportStatus, disputeStatus: "RESOLVED" }),
      notes: `Dispute resolved: ${parsed.data.finalDecision}`,
    },
  });

  // Notify researcher
  await prisma.notification.create({
    data: {
      userId: dispute.researcherId,
      type: "DISPUTE_RESOLVED",
      title: "Dispute resolved",
      message: `Your dispute on report "${dispute.report.title}" has been resolved: ${parsed.data.finalDecision}`,
      link: `/disputes`,
    },
  });

  return apiSuccess(updated);
}

// ─── GET /api/disputes/[id] ───────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      report: {
        include: {
          program: { select: { id: true, title: true, slug: true } },
        },
      },
      researcher: { select: { id: true, name: true, username: true } },
      decidedBy: { select: { id: true, name: true, username: true } },
    },
  });

  if (!dispute) return apiError("Dispute not found", 404);

  // Access control
  if (
    dispute.researcherId !== user.id &&
    user.role !== "ADMIN" &&
    user.role !== "TRIAGER"
  ) {
    return apiError("Forbidden", 403);
  }

  return apiSuccess(dispute);
}
