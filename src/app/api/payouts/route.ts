import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { payoutSchema } from "@/lib/validations";

// ─── POST /api/payouts — create payout ───────────────────────

export async function POST(req: NextRequest) {
  const { error, user } = await requireRole(req, "COMPANY", "ADMIN");
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = payoutSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed: " + JSON.stringify(parsed.error.flatten()), 400);
    }

    const report = await prisma.report.findUnique({
      where: { id: parsed.data.reportId },
      include: { program: true, payout: true },
    });
    if (!report) return apiError("Report not found", 404);
    if (report.program.ownerId !== user.id && user.role !== "ADMIN") {
      return apiError("Forbidden", 403);
    }
    if (report.payout) return apiError("Payout already exists for this report", 409);

    const { rewardAmount, platformFeePct } = parsed.data;
    const platformFee = rewardAmount * (platformFeePct / 100);
    const researcherNet = rewardAmount - platformFee;

    const payout = await prisma.payout.create({
      data: {
        reportId: parsed.data.reportId,
        userId: report.reporterId,
        rewardAmount,
        platformFeePct,
        platformFee,
        researcherNet,
        status: "PENDING",
      },
    });

    // Update report status
    await prisma.report.update({
      where: { id: parsed.data.reportId },
      data: { status: "ACCEPTED" },
    });

    // Timeline event
    await prisma.reportTimelineEvent.create({
      data: {
        reportId: parsed.data.reportId,
        userId: user.id,
        eventType: "PAYOUT_CREATED",
        newValue: JSON.stringify({ rewardAmount, platformFee, researcherNet }),
        notes: `Payout of $${rewardAmount} created. Platform fee: $${platformFee} (${platformFeePct}%). Researcher net: $${researcherNet}`,
      },
    });

    // Notify researcher
    await prisma.notification.create({
      data: {
        userId: report.reporterId,
        type: "PAYOUT",
        title: "Payout issued!",
        message: `A payout of $${researcherNet.toFixed(2)} has been issued for your report "${report.title}".`,
        link: `/reports/${report.id}`,
      },
    });

    // Update transparency metrics
    await updateTransparencyMetrics(report.programId);

    return apiSuccess(payout, 201);
  } catch (err) {
    console.error("Payout create error:", err);
    return apiError("Internal server error", 500);
  }
}

// ─── GET /api/payouts — list payouts ─────────────────────────

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  // Researchers see only their own payouts
  if (user.role === "RESEARCHER") {
    where.userId = user.id;
  }

  const payouts = await prisma.payout.findMany({
    where,
    include: {
      report: { select: { id: true, title: true, status: true } },
      user: { select: { id: true, name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(payouts);
}

async function updateTransparencyMetrics(programId: string) {
  const reports = await prisma.report.findMany({
    where: { programId },
    include: { payout: true },
  });

  const validReports = reports.filter((r) => r.status === "PAID" || r.status === "ACCEPTED");
  const duplicateReports = reports.filter((r) => r.status === "DUPLICATE_CLAIMED");
  const rejectedReports = reports.filter((r) => r.status === "REJECTED");

  const totalPaid = validReports.reduce((sum, r) => sum + (r.payout?.rewardAmount || 0), 0);

  await prisma.transparencyMetric.upsert({
    where: { programId },
    update: {
      totalPaid,
      validReportCount: validReports.length,
      totalReportCount: reports.length,
      duplicateRate: reports.length > 0 ? (duplicateReports.length / reports.length) * 100 : 0,
      rejectionRate: reports.length > 0 ? (rejectedReports.length / reports.length) * 100 : 0,
    },
    create: {
      programId,
      totalPaid,
      validReportCount: validReports.length,
      totalReportCount: reports.length,
      duplicateRate: reports.length > 0 ? (duplicateReports.length / reports.length) * 100 : 0,
      rejectionRate: reports.length > 0 ? (rejectedReports.length / reports.length) * 100 : 0,
    },
  });
}
