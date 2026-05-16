import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params;
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { program: true },
  });
  if (!report) return apiError("Report not found", 404);

  // Only reporter, triager, program owner, or admin can comment
  const canComment =
    report.reporterId === user.id ||
    report.triagerId === user.id ||
    report.program.ownerId === user.id ||
    user.role === "ADMIN" ||
    user.role === "TRIAGER";

  if (!canComment) return apiError("Forbidden", 403);

  const body = await req.json();
  if (!body.content || body.content.trim().length < 1) {
    return apiError("Comment content is required", 400);
  }

  const comment = await prisma.reportComment.create({
    data: {
      reportId,
      authorId: user.id,
      content: body.content,
      isPrivate: body.isPrivate || false,
    },
    include: {
      author: { select: { id: true, name: true, username: true, role: true } },
    },
  });

  // Timeline event
  await prisma.reportTimelineEvent.create({
    data: {
      reportId,
      userId: user.id,
      eventType: "COMMENT",
      notes: body.content.substring(0, 200),
    },
  });

  return apiSuccess(comment, 201);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params;
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const comments = await prisma.reportComment.findMany({
    where: { reportId },
    include: {
      author: { select: { id: true, name: true, username: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return apiSuccess(comments);
}
