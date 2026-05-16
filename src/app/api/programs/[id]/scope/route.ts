import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { scopeAssetSchema } from "@/lib/validations";

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
  const parsed = scopeAssetSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Validation failed: " + JSON.stringify(parsed.error.flatten()), 400);
  }

  const asset = await prisma.scopeAsset.create({
    data: { ...parsed.data, programId },
  });

  return apiSuccess(asset, 201);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: programId } = await params;
  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("assetId");

  if (!assetId) return apiError("assetId query param required", 400);

  const { error, user } = await requireAuth(req);
  if (error) return error;

  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) return apiError("Program not found", 404);
  if (program.ownerId !== user.id && user.role !== "ADMIN") {
    return apiError("Forbidden", 403);
  }

  await prisma.scopeAsset.delete({ where: { id: assetId } });
  return apiSuccess({ deleted: true });
}
