import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { generateCaseId } from "@/lib/id-generator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
    });
  } catch (err: any) {
    console.error("[Cases GET API Error]:", err);
    return NextResponse.json({ success: false, detail: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();

    const {
      title,
      category = "CIVIL",
      summary = "",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, detail: "Case Title is required." }, { status: 400 });
    }

    const caseId = generateCaseId();

    return NextResponse.json({
      success: true,
      message: "Case folder successfully created",
      data: {
        id: caseId,
        userId: user ? user.id : "",
        title: title.trim(),
        category: category.toUpperCase(),
        summary: summary || "",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[Case Create Error]:", err);
    return NextResponse.json({ success: false, detail: err.message || "Failed to create case folder" }, { status: 500 });
  }
}
