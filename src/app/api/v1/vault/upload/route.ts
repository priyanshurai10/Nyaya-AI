import { NextRequest, NextResponse } from 'next/server';
import { vaultItems } from '../store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("vault_category") as string) || "Evidence";

    if (!file) {
      return NextResponse.json({ success: false, detail: "No file provided" }, { status: 400 });
    }

    const newItem = {
      id: `vault-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      filename: file.name,
      file_type: file.type || "application/octet-stream",
      upload_path: `/uploads/${file.name}`,
      vault_category: category,
      file_size: file.size,
      created_at: new Date().toISOString()
    };

    vaultItems.unshift(newItem);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully to secure vault",
      data: newItem
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: err.message || "Upload failed" }, { status: 500 });
  }
}
