import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const caseId = params.id;
    return NextResponse.json({
      success: true,
      data: {
        id: caseId,
        title: `Case ${caseId}`,
        category: "CIVIL",
        summary: "Legal case folder",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const caseId = params.id;
    const body = await req.json();

    return NextResponse.json({
      success: true,
      message: "Case parameters updated successfully",
      data: { id: caseId, ...body },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const caseId = params.id;
    return NextResponse.json({
      success: true,
      message: "Case deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: err.message }, { status: 500 });
  }
}
