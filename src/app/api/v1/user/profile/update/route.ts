import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { name, dob, gender, marital_status, blood_group, occupation, education, aadhaar, pan } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (dob !== undefined) updateData.dob = dob;
    if (gender !== undefined) updateData.gender = gender;
    if (marital_status !== undefined) updateData.maritalStatus = marital_status;
    if (blood_group !== undefined) updateData.bloodGroup = blood_group;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (education !== undefined) updateData.education = education;
    if (aadhaar && aadhaar.trim()) updateData.aadhaarEnc = `ENC_${aadhaar.trim()}`;
    if (pan && pan.trim()) updateData.panEnc = `ENC_${pan.trim()}`;

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error: any) {
    console.error("[User Profile Update Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Update failed." }, { status: 500 });
  }
}
