import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ success: true, data: [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    const caseId = params.id;
    const body = await req.json();
    const { noteText } = body;

    if (!noteText || !noteText.trim()) {
      return NextResponse.json({ success: false, detail: "Note text is required." }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Note added successfully", 
      data: { id: caseId, noteText: noteText.trim(), author: user?.name || "User" } 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: err.message }, { status: 500 });
  }
}
