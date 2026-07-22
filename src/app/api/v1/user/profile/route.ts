import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nyaya_ai_super_secret_jwt_key_2026_production"
);

export async function GET(request: Request) {
  try {
    // 1. Get token from cookies or Authorization header
    let token = "";
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/nyaya_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Verify JWT
    let payload;
    try {
      const verified = await jwtVerify(token, SECRET_KEY);
      payload = verified.payload;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session token." },
        { status: 401 }
      );
    }

    const userId = (payload.id || payload.sub) as string;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload structure." },
        { status: 401 }
      );
    }

    // 3. Query user from Database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    // 4. Return user profile details
    return NextResponse.json({
      success: true,
      message: "Profile retrieved successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt ? user.createdAt.toISOString() : null
      }
    });
  } catch (error: any) {
    console.error("[Profile API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
