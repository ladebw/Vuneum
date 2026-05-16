import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { duplicateClaimSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const { error, user } = await requireRole(req, "TRIAGER", "ADMIN");
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = duplicateClaimSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        "All duplicate proof fields are required: " +
          JSON.stringify(parsed.error.flatten()),
        400
      );
    }

    const {
      duplicateReportId,
      rootCauseExplanation,
      assetComparison,
      impactOverlapComparison,
      firstSubmissionComparison,
      triagerReasoning,
    } = parsed.data;

    // Get the report being marked as duplicate
    const report = await prisma.report.findUnique({
      where: { id: duplicateReportId },
    });
    if (!report) return apiError("Report not found", 404);

    // Get original report
    const originalReport = await prisma.report.findUnique({
      where: { id: body.originalReportId },
    });
    if (!originalReport) return apiError("Original report not found", 404);

    // Create duplicate claim with full evidence
    const claim = await prisma.duplicateClaim.create({
      data: {
        originalReportId: body.originalReportId,
        duplicateReportId,
        rootCauseExplanation,
        assetComparison,
        impactOverlapComparison,
        firstSubmissionComparison,
        triagerReasoning,
      },
    });

    // Update report status to DUPLICATE_CLAIMED
    await prisma.report.update({
      where: { id: duplicateReportId },
      data: { status: "DUPLICATE_CLAIMED", triagerId: user.id },
    });

    // Timeline events
    await prisma.reportTimelineEvent.create({
      data: {
        reportId: duplicateReportId,
        userId: user.id,
        eventType: "DUPLICATE_CLAIMED",
        oldValue: JSON.stringify({ status: report.status }),
        newValue: JSON.stringify({
          status: "DUPLICATE_CLAIMED",
          duplicateOf: body.originalReportId,
        }),
        notes: triagerReasoning,
      },
    });

    // Notify reporter
    await prisma.notification.create({
      data: {
        userId: report.reporterId,
        type: "DUPLICATE",
        title: "Report marked as duplicate",
        message: `Your report "${report.title}" has been marked as a duplicate of another submission.`,
        link: `/reports/${duplicateReportId}`,
      },
    });

    return apiSuccess(claim, 201);
  } catch (err) {
    console.error("Duplicate claim error:", err);
    return apiError("Internal server error", 500);
  }
}
