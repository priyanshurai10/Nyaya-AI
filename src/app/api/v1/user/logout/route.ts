import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully."
    });

    // Clear the secure JWT cookie
    response.cookies.set("nyaya_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0) // Immediately expire
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to logout.", error: error.message },
      { status: 500 }
    );
  }
}
