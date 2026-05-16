import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { programSchema, scopeAssetSchema, rewardTierSchema } from "@/lib/validations";

// ─── GET /api/programs — list programs ──────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const visibility = searchParams.get("visibility");

  const where: any = {};
  if (status) where.status = status;
  if (visibility) where.visibility = visibility;

  const programs = await prisma.program.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, username: true } },
      organization: { select: { id: true, name: true, slug: true } },
      _count: { select: { reports: true, scopeAssets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(programs);
}

// ─── POST /api/programs — create program ────────────────────

export async function POST(req: NextRequest) {
  const { error, user } = await requireRole(req, "COMPANY", "ADMIN");
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = programSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed: " + JSON.stringify(parsed.error.flatten()), 400);
    }

    const slug = parsed.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const program = await prisma.program.create({
      data: {
        ...parsed.data,
        slug,
        ownerId: user.id,
      },
    });

    // Create transparency metric entry
    await prisma.transparencyMetric.create({
      data: { programId: program.id },
    });

    return apiSuccess(program, 201);
  } catch (err: any) {
    if (err.code === "P2002") {
      return apiError("A program with this slug already exists", 409);
    }
    console.error("Create program error:", err);
    return apiError("Internal server error", 500);
  }
}
