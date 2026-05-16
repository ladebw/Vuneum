import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

// ─── GET /api/reputation — get reputation profiles ──────────────────

export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error; // authenticated but allow public-ish access

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const where: any = {};
  if (userId) where.userId = userId;

  const profiles = await prisma.reputationProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
    orderBy: { overallScore: "desc" },
  });

  // Recalculate scores for freshness
  for (const profile of profiles) {
    const reports = await prisma.report.findMany({
      where: { reporterId: profile.userId },
      include: { dispute: true },
    });

    const validReports = reports.filter((r) => r.status === "PAID" || r.status === "ACCEPTED");
    const rejectedReports = reports.filter((r) => r.status === "REJECTED");
    const duplicateReports = reports.filter((r) => r.status === "DUPLICATE_CLAIMED");

    const validCount = validReports.length;
    const totalCount = reports.length || 1;
    const falsePositiveRate = totalCount > 0 ? rejectedReports.length / totalCount : 0;

    // Signal quality: valid reports / total (inverted from FP rate)
    const signalQuality = totalCount > 0 ? validCount / totalCount : 0;

    // Severity accuracy: check if claimed matches actual (when set)
    let severityAccuracy = 0.5; // default middle
    const reportsWithActual = reports.filter((r) => r.actualSeverity);
    if (reportsWithActual.length > 0) {
      const matches = reportsWithActual.filter((r) => r.claimedSeverity === r.actualSeverity);
      severityAccuracy = matches.length / reportsWithActual.length;
    }

    // Dispute success rate
    const disputes = reports.flatMap((r) => (r.dispute ? [r.dispute] : []));
    const resolvedDisputes = disputes.filter((d) => d.status === "RESOLVED");
    let disputeSuccessRate = 0;
    if (resolvedDisputes.length > 0) {
      const wins = resolvedDisputes.filter((d) =>
        d.finalDecision?.toLowerCase().includes("overrule") ||
        d.finalDecision?.toLowerCase().includes("accept")
      );
      disputeSuccessRate = wins.length / resolvedDisputes.length;
    }

    // Overall score (weighted)
    const overallScore = (
      signalQuality * 0.35 +
      severityAccuracy * 0.25 +
      (1 - falsePositiveRate) * 0.25 +
      disputeSuccessRate * 0.15
    ) * 100;

    let rank = "Bronze";
    if (overallScore >= 85) rank = "Diamond";
    else if (overallScore >= 70) rank = "Platinum";
    else if (overallScore >= 55) rank = "Gold";
    else if (overallScore >= 40) rank = "Silver";

    await prisma.reputationProfile.update({
      where: { id: profile.id },
      data: {
        validReports: validCount,
        totalReports: totalCount,
        falsePositiveRate,
        signalQuality,
        severityAccuracy,
        disputeSuccessRate,
        overallScore,
        rank,
      },
    });
  }

  // Re-fetch updated profiles
  const updated = await prisma.reputationProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
    orderBy: { overallScore: "desc" },
  });

  return apiSuccess(updated);
}
