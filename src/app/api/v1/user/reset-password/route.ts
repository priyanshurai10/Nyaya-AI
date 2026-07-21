import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nyaya_ai_super_secret_jwt_key_2026_production"
);

export async function POST(request: Request) {
  try {
    const { token, code, password } = await request.json();

    if (!token || !code || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required verification fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Verify recovery token
    let payload;
    try {
      const verified = await jwtVerify(token, SECRET_KEY);
      payload = verified.payload;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: "Session expired. Please request another recovery code." },
        { status: 401 }
      );
    }

    // Check code matches
    if (code !== payload.code) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code." },
        { status: 400 }
      );
    }

    const userId = payload.sub as string;

    // Hash new password
    const passwordHash = await hash(password, 10);

    // Update password in DB
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now log in."
    });
  } catch (error: any) {
    console.error("[Reset Password API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
