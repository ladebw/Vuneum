import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { rewardTierSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: programId } = await params;
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) return apiError("Program not found", 404);
  if (program.ownerId !== user.id && user.role !== "ADMIN") {
    return apiError("Forbidden", 403);
  }

  const body = await req.json();
  const parsed = rewardTierSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Validation failed: " + JSON.stringify(parsed.error.flatten()), 400);
  }

  const tier = await prisma.rewardTier.create({
    data: { ...parsed.data, programId },
  });

  return apiSuccess(tier, 201);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: programId } = await params;
  const { searchParams } = new URL(req.url);
  const tierId = searchParams.get("tierId");

  if (!tierId) return apiError("tierId query param required", 400);

  const { error, user } = await requireAuth(req);
  if (error) return error;

  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) return apiError("Program not found", 404);
  if (program.ownerId !== user.id && user.role !== "ADMIN") {
    return apiError("Forbidden", 403);
  }

  await prisma.rewardTier.delete({ where: { id: tierId } });
  return apiSuccess({ deleted: true });
}
