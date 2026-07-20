import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";
import { hash } from "bcryptjs";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nyaya_ai_super_secret_jwt_key_2026_production"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, password } = body;

    // Validate request body
    if (!name || !password) {
      return NextResponse.json(
        { success: false, message: "Name and password are required." },
        { status: 400 }
      );
    }

    if (!email && !mobile) {
      return NextResponse.json(
        { success: false, message: "Either email or mobile number is required." },
        { status: 400 }
      );
    }

    // Resolve unique email for DB schema constraints
    const targetEmail = email ? email.trim().toLowerCase() : `${mobile}@nyaya.ai`;
    const targetPhone = mobile ? mobile.trim() : null;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: targetEmail },
          ...(targetPhone ? [{ phone: targetPhone }] : [])
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email or mobile number already exists." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: targetEmail,
        phone: targetPhone,
        passwordHash,
        role: "USER"
      }
    });

    // Generate JWT token
    const token = await new SignJWT({ sub: user.id, id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET_KEY);

    // Set secure cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful.",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      },
      { status: 201 }
    );

    response.cookies.set("nyaya_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return response;
  } catch (error: any) {
    console.error("[Register API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
