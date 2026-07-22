import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nyaya_ai_super_secret_jwt_key_2026_production"
);

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function signJWT(payload: Record<string, any>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser() {
  try {
    const token = cookies().get("nyaya_token")?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    const userId = (payload?.sub || payload?.id) as string | undefined;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        district: true,
        state: true,
        pincode: true,
      },
    });

    return user;
  } catch (err) {
    return null;
  }
}

export async function getUserFromRequest(req: Request) {
  try {
    let token: string | undefined;
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token) {
      token = cookies().get("nyaya_token")?.value;
    }
    if (!token) return null;

    const payload = await verifyJWT(token);
    const userId = (payload?.sub || payload?.id) as string | undefined;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        district: true,
        state: true,
        pincode: true,
      },
    });

    return user;
  } catch (err) {
    return null;
  }
}

export async function requireAdmin(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "ADMIN") {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Super Admin privileges required." },
        { status: 403 }
      ),
    };
  }
  return { user, errorResponse: null };
}

export function setSessionCookie(token: string) {
  cookies().set("nyaya_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearSessionCookie() {
  cookies().delete("nyaya_token");
}
