import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, user } = await requireRole(req, "COMPANY", "ADMIN");
  if (error) return error;

  const payout = await prisma.payout.findUnique({
    where: { id },
    include: { report: { include: { program: true } } },
  });
  if (!payout) return apiError("Payout not found", 404);
  if (payout.report.program.ownerId !== user.id && user.role !== "ADMIN") {
    return apiError("Forbidden", 403);
  }

  const body = await req.json();

  const updated = await prisma.payout.update({
    where: { id },
    data: {
      status: body.status || "PAID",
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      paymentRef: body.paymentRef,
      paymentProof: body.paymentProof,
    },
  });

  if (body.status === "PAID") {
    await prisma.report.update({
      where: { id: payout.reportId },
      data: { status: "PAID" },
    });
  }

  await prisma.reportTimelineEvent.create({
    data: {
      reportId: payout.reportId,
      userId: user.id,
      eventType: "PAYOUT_COMPLETED",
      newValue: JSON.stringify({ status: body.status || "PAID" }),
      notes: `Payout of $${payout.researcherNet} marked as paid. Ref: ${body.paymentRef || "N/A"}`,
    },
  });

  return apiSuccess(updated);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, user } = await requireRole(req, "COMPANY", "ADMIN", "RESEARCHER");
  if (error) return error;

  const payout = await prisma.payout.findUnique({
    where: { id },
    include: {
      report: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, username: true } },
    },
  });

  if (!payout) return apiError("Payout not found", 404);
  if (payout.userId !== user.id && user.role !== "ADMIN" && user.role !== "COMPANY") {
    return apiError("Forbidden", 403);
  }

  return apiSuccess(payout);
}
