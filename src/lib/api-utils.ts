import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type Role = "RESEARCHER" | "COMPANY" | "TRIAGER" | "ADMIN";

export async function getSessionUser(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as any;
}

export async function requireAuth(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  }
  return { error: null, user };
}

export async function requireRole(req: NextRequest, ...roles: Role[]) {
  const { error, user } = await requireAuth(req);
  if (error) return { error, user: null };
  if (!roles.includes(user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      user: null,
    };
  }
  return { error: null, user };
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess(data: any, status = 200) {
  return NextResponse.json(data, { status });
}
