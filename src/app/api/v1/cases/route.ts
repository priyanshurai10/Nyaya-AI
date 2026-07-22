import { NextRequest, NextResponse } from 'next/server';
import { casesStore, CaseItem } from './store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: casesStore
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, summary, status } = body;

    if (!title) {
      return NextResponse.json({ success: false, detail: "Case Title is required." }, { status: 400 });
    }

    const newCase: CaseItem = {
      id: `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      category: category || "civil",
      type: `${category ? category.charAt(0).toUpperCase() + category.slice(1) : "Civil"} Dispute`,
      court: "District & Sessions Court",
      status: status || "active",
      summary: summary || "",
      next_hearing: new Date(Date.now() + 86400000 * 7).toISOString(),
      created_at: new Date().toISOString()
    };

    casesStore.unshift(newCase);

    return NextResponse.json({
      success: true,
      message: "Case folder successfully created",
      data: newCase
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: err.message || "Failed to create case folder" }, { status: 500 });
  }
}
