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
    const {
      name,
      phone,
      mobile,
      dob,
      gender,
      marital_status,
      blood_group,
      occupation,
      education,
      address,
      state,
      district,
      pincode,
      preferred_language,
      aadhaar,
      pan,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined || mobile !== undefined) updateData.phone = (phone || mobile || "").trim();
    if (dob !== undefined) updateData.dob = dob;
    if (gender !== undefined) updateData.gender = gender;
    if (marital_status !== undefined) updateData.maritalStatus = marital_status;
    if (blood_group !== undefined) updateData.bloodGroup = blood_group;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (education !== undefined) updateData.education = education;
    if (address !== undefined) updateData.address = address;
    if (state !== undefined) updateData.state = state;
    if (district !== undefined) updateData.district = district;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (preferred_language !== undefined) updateData.preferredLanguage = preferred_language;

    if (aadhaar && aadhaar.trim()) updateData.aadhaarEnc = `ENC_${aadhaar.trim()}`;
    if (pan && pan.trim()) updateData.panEnc = `ENC_${pan.trim()}`;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        dob: updatedUser.dob,
        gender: updatedUser.gender,
        marital_status: updatedUser.maritalStatus,
        blood_group: updatedUser.bloodGroup,
        occupation: updatedUser.occupation,
        education: updatedUser.education,
        address: updatedUser.address,
        state: updatedUser.state,
        district: updatedUser.district,
        pincode: updatedUser.pincode,
        preferred_language: updatedUser.preferredLanguage,
      }
    });
  } catch (error: any) {
    console.error("[User Profile Update Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Update failed." }, { status: 500 });
  }
}
