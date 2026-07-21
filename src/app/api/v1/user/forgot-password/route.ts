import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nyaya_ai_super_secret_jwt_key_2026_production"
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, message: "Email or username is required." },
        { status: 400 }
      );
    }

    // Query user by email or phone (location/district column maps to database queries)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { phone: cleanEmail }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found matching this identifier." },
        { status: 404 }
      );
    }

    // Generate a stateless 10-minute recovery token
    const recoveryCode = "123456"; // Simulated standard OTP
    const recoveryToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      code: recoveryCode
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("10m")
      .sign(SECRET_KEY);

    return NextResponse.json({
      success: true,
      message: "Recovery verification OTP code '123456' sent successfully.",
      recovery_token: recoveryToken
    });
  } catch (error: any) {
    console.error("[Forgot Password API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
