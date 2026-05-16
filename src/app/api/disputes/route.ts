import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { disputeSchema, disputeResponseSchema } from "@/lib/validations";

// ─── POST /api/disputes — create dispute ─────────────────────

export async function POST(req: NextRequest) {
  const { error, user } = await requireRole(req, "RESEARCHER", "ADMIN");
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = disputeSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed: " + JSON.stringify(parsed.error.flatten()), 400);
    }

    const report = await prisma.report.findUnique({
      where: { id: parsed.data.reportId },
    });
    if (!report) return apiError("Report not found", 404);
    if (report.reporterId !== user.id && user.role !== "ADMIN") {
      return apiError("You can only dispute your own reports", 403);
    }

    // Check report is in a disputable state
    const disputableStatuses = ["DUPLICATE_CLAIMED", "ACCEPTED", "REJECTED", "VALIDATED"];
    if (!disputableStatuses.includes(report.status)) {
      return apiError(`Cannot dispute a report in status: ${report.status}`, 400);
    }

    // Check no open dispute already exists
    const existingDispute = await prisma.dispute.findFirst({
      where: { reportId: report.id, status: { in: ["OPEN", "UNDER_REVIEW"] } },
    });
    if (existingDispute) {
      return apiError("An open dispute already exists for this report", 409);
    }

    const dispute = await prisma.dispute.create({
      data: {
        reportId: report.id,
        researcherId: user.id,
        disputeType: parsed.data.disputeType,
        researcherArgument: parsed.data.researcherArgument,
        isPublic: parsed.data.isPublic,
      },
    });

    // Update report status
    await prisma.report.update({
      where: { id: report.id },
      data: { status: "DISPUTED" },
    });

    // Timeline event
    await prisma.reportTimelineEvent.create({
      data: {
        reportId: report.id,
        userId: user.id,
        eventType: "DISPUTE_OPENED",
        oldValue: JSON.stringify({ status: report.status }),
        newValue: JSON.stringify({ status: "DISPUTED", disputeType: parsed.data.disputeType }),
        notes: `Dispute opened: ${parsed.data.disputeType}. ${parsed.data.researcherArgument.substring(0, 200)}`,
      },
    });

    return apiSuccess(dispute, 201);
  } catch (err) {
    console.error("Dispute create error:", err);
    return apiError("Internal server error", 500);
  }
}

// ─── GET /api/disputes — list disputes ────────────────────────

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const reportId = searchParams.get("reportId");

  const where: any = {};
  if (status) where.status = status;
  if (reportId) where.reportId = reportId;

  // Researchers see only their own disputes
  if (user.role === "RESEARCHER") {
    where.researcherId = user.id;
  }

  const disputes = await prisma.dispute.findMany({
    where,
    include: {
      report: { select: { id: true, title: true, status: true } },
      researcher: { select: { id: true, name: true, username: true } },
      decidedBy: { select: { id: true, name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(disputes);
}
