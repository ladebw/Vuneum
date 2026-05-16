import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";

// ─── GET /api/admin/stats — platform-wide stats ───────────────

export async function GET(req: NextRequest) {
  const { error } = await requireRole(req, "ADMIN");
  if (error) return error;

  const [
    userCount,
    researcherCount,
    companyCount,
    triagerCount,
    programCount,
    reportCount,
    disputeCount,
    totalPaid,
    organizationCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "RESEARCHER" } }),
    prisma.user.count({ where: { role: "COMPANY" } }),
    prisma.user.count({ where: { role: "TRIAGER" } }),
    prisma.program.count(),
    prisma.report.count(),
    prisma.dispute.count(),
    prisma.payout.aggregate({ _sum: { rewardAmount: true } }),
    prisma.organization.count(),
  ]);

  const reportsByStatus = await prisma.report.groupBy({
    by: ["status"],
    _count: true,
  });

  return apiSuccess({
    users: { total: userCount, researchers: researcherCount, companies: companyCount, triagers: triagerCount },
    programs: programCount,
    organizations: organizationCount,
    reports: { total: reportCount, byStatus: reportsByStatus },
    disputes: disputeCount,
    totalPaid: totalPaid._sum.rewardAmount || 0,
  });
}

// ─── PATCH /api/admin/users/[id]/role — change user role ──────

export async function PATCH(req: NextRequest) {
  const { error } = await requireRole(req, "ADMIN");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const role = searchParams.get("role");

  if (!userId || !role) return apiError("userId and role required", 400);

  const validRoles = ["RESEARCHER", "COMPANY", "TRIAGER", "ADMIN"];
  if (!validRoles.includes(role)) return apiError("Invalid role", 400);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
    select: { id: true, email: true, username: true, role: true },
  });

  return apiSuccess(user);
}
