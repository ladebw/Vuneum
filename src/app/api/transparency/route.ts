import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const metrics = await prisma.transparencyMetric.findMany({
    include: {
      program: { select: { id: true, title: true, slug: true } },
    },
  });

  return apiSuccess(metrics);
}
