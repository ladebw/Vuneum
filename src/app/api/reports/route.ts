import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { reportSchema } from "@/lib/validations";

// ─── GET /api/reports — list reports ─────────────────────────

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const programId = searchParams.get("programId");
  const reporterId = searchParams.get("reporterId");
  const triagerId = searchParams.get("triagerId");

  const where: any = {};

  // Researchers see only their own reports; triagers/admins/companies see program reports
  if (user.role === "RESEARCHER") {
    if (reporterId && reporterId !== user.id && user.role !== "ADMIN") {
      return apiError("Forbidden", 403);
    }
    where.reporterId = reporterId || user.id;
  }

  if (status) where.status = status;
  if (programId) where.programId = programId;
  if (triagerId && (user.role === "TRIAGER" || user.role === "ADMIN")) {
    where.triagerId = triagerId;
  }

  // Company users see reports for their programs
  if (user.role === "COMPANY") {
    const userPrograms = await prisma.program.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    where.programId = { in: userPrograms.map((p) => p.id) };
  }

  const reports = await prisma.report.findMany({
    where,
    include: {
      reporter: { select: { id: true, name: true, username: true } },
      triager: { select: { id: true, name: true, username: true } },
      program: { select: { id: true, title: true, slug: true } },
      _count: { select: { evidence: true, comments: true, timeline: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(reports);
}

// ─── POST /api/reports — submit new report ────────────────────

export async function POST(req: NextRequest) {
  const { error, user } = await requireRole(req, "RESEARCHER", "ADMIN");
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed: " + JSON.stringify(parsed.error.flatten()), 400);
    }

    const { evidence, ...reportData } = parsed.data;

    // Verify program exists and is accepting reports
    const program = await prisma.program.findUnique({
      where: { id: reportData.programId },
    });
    if (!program) return apiError("Program not found", 404);
    if (program.status === "CLOSED" || program.status === "DRAFT") {
      return apiError("Program is not accepting reports", 400);
    }

    const report = await prisma.report.create({
      data: {
        ...reportData,
        reporterId: user.id,
        evidence: evidence
          ? { create: evidence }
          : undefined,
      },
    });

    // Create immutable timeline event
    await prisma.reportTimelineEvent.create({
      data: {
        reportId: report.id,
        userId: user.id,
        eventType: "SUBMITTED",
        newValue: JSON.stringify({ status: "SUBMITTED" }),
        notes: "Report submitted by researcher",
      },
    });

    return apiSuccess(report, 201);
  } catch (err) {
    console.error("Create report error:", err);
    return apiError("Internal server error", 500);
  }
}
