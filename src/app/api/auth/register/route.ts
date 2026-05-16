import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, username, name, password, role, organizationName } = parsed.data;

    // Check existing user
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    // Create organization if company role
    let organizationId: string | null = null;
    if (role === "COMPANY" && organizationName) {
      const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const org = await prisma.organization.create({
        data: { name: organizationName, slug },
      });
      organizationId = org.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        passwordHash,
        role,
        organizationId,
      },
    });

    // Create reputation profile for researchers
    if (role === "RESEARCHER") {
      await prisma.reputationProfile.create({
        data: { userId: user.id },
      });
    }

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
