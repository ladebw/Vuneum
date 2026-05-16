import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

// ─── GET /api/reports/[id] — get report detail ────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, name: true, username: true, avatarUrl: true } },
      triager: { select: { id: true, name: true, username: true } },
      program: {
        select: { id: true, title: true, slug: true, ownerId: true },
      },
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

  if (!report) return apiError("Report not found", 404);

  // Access control: reporter, triager, program owner, or admin
  if (
    report.reporterId !== user.id &&
    report.triagerId !== user.id &&
    report.program.ownerId !== user.id &&
    user.role !== "ADMIN" &&
    user.role !== "TRIAGER"
  ) {
    return apiError("Forbidden", 403);
  }

  return apiSuccess(report);
}

// ─── PATCH /api/reports/[id] — update report / triage action ──

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { program: true },
  });
  if (!report) return apiError("Report not found", 404);

  const body = await req.json();
  const oldStatus = report.status;

  // Determine who can change what
  const isTriager = user.role === "TRIAGER" || user.role === "ADMIN";
  const isProgramOwner = report.program.ownerId === user.id;
  const isReporter = report.reporterId === user.id;

  // Triagers/admins can change status and assign
  if (body.status && isTriager) {
    const validTransitions: Record<string, string[]> = {
      SUBMITTED: ["VIEWED", "UNDER_REVIEW", "NEEDS_MORE_INFO", "CLOSED"],
      VIEWED: ["UNDER_REVIEW", "NEEDS_MORE_INFO", "INVALID", "CLOSED"],
      UNDER_REVIEW: ["NEEDS_MORE_INFO", "VALIDATED", "DUPLICATE_CLAIMED", "REJECTED", "CLOSED"],
      NEEDS_MORE_INFO: ["UNDER_REVIEW", "VALIDATED", "REJECTED", "CLOSED"],
      VALIDATED: ["ACCEPTED", "REJECTED", "DISPUTED", "CLOSED"],
      DUPLICATE_CLAIMED: ["CLOSED", "DISPUTED"],
      DISPUTED: ["ACCEPTED", "REJECTED", "VALIDATED", "CLOSED"],
      ACCEPTED: ["PAID", "DISCLOSED", "CLOSED"],
      REJECTED: ["CLOSED", "DISPUTED"],
      PAID: ["DISCLOSED", "CLOSED"],
      DISCLOSED: ["CLOSED"],
      CLOSED: [],
    };

    const allowed = validTransitions[oldStatus] || [];
    if (!allowed.includes(body.status)) {
      return apiError(
        `Invalid transition: ${oldStatus} → ${body.status}. Allowed: ${allowed.join(", ")}`,
        400
      );
    }

    await prisma.report.update({
      where: { id },
      data: {
        status: body.status,
        triagerId: body.triagerId || user.id,
        actualSeverity: body.actualSeverity,
      },
    });

    // Immutable timeline event
    await prisma.reportTimelineEvent.create({
      data: {
        reportId: id,
        userId: user.id,
        eventType: "STATUS_CHANGE",
        oldValue: JSON.stringify({ status: oldStatus }),
        newValue: JSON.stringify({ status: body.status }),
        notes: body.timelineNote || `Status changed from ${oldStatus} to ${body.status}`,
      },
    });
  }

  // Reporter can add notes / request info
  if (body.internalNotes && isReporter) {
    await prisma.report.update({
      where: { id },
      data: { internalNotes: body.internalNotes },
    });
  }

  // Program owner can add internal notes
  if (body.internalNotes && isProgramOwner) {
    await prisma.report.update({
      where: { id },
      data: { internalNotes: body.internalNotes },
    });
  }

  const updated = await prisma.report.findUnique({
    where: { id },
    include: {
      timeline: {
        include: { user: { select: { id: true, name: true, username: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return apiSuccess(updated);
}
