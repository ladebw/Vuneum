import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { scopeAssetSchema, rewardTierSchema } from "@/lib/validations";

// ─── GET /api/programs/[id] ──────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, username: true, avatarUrl: true } },
      organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
      scopeAssets: true,
      rewardTiers: true,
      transparency: true,
      _count: { select: { reports: true } },
    },
  });

  if (!program) return apiError("Program not found", 404);
  return apiSuccess(program);
}

// ─── PATCH /api/programs/[id] ─────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const program = await prisma.program.findUnique({ where: { id } });
  if (!program) return apiError("Program not found", 404);
  if (program.ownerId !== user.id && user.role !== "ADMIN") {
    return apiError("Forbidden", 403);
  }

  const body = await req.json();
  const updated = await prisma.program.update({
    where: { id },
    data: body,
  });

  return apiSuccess(updated);
}

// ─── DELETE /api/programs/[id] ────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const program = await prisma.program.findUnique({ where: { id } });
  if (!program) return apiError("Program not found", 404);
  if (program.ownerId !== user.id && user.role !== "ADMIN") {
    return apiError("Forbidden", 403);
  }

  await prisma.program.delete({ where: { id } });
  return apiSuccess({ deleted: true });
}
