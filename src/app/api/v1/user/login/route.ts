import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";
import { compare } from "bcryptjs";

export const dynamic = "force-dynamic";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nyaya_ai_super_secret_jwt_key_2026_production"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required." },
        { status: 400 }
      );
    }

    // Try finding user by email or phone
    const cleanUsername = username.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanUsername },
          { phone: username.trim() },
          // Check if username was a mobile number and matched generated email
          { email: `${username.trim()}@nyaya.ai` }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email, mobile number, or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email, mobile number, or password." },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await new SignJWT({ sub: user.id, id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET_KEY);

    // Set secure cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        token,
        access_token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      },
      { status: 200 }
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
    console.error("[Login API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
