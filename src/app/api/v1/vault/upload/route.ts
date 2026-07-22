import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { vaultStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("vault_category") as string) || (formData.get("category") as string) || "LEGAL_DOC";

    if (!file) {
      return NextResponse.json({ success: false, detail: "No file provided" }, { status: 400 });
    }

    const saved = await vaultStorage.saveVaultFile(file, category);

    const documentRecord = await prisma.fileMetadata.create({
      data: {
        id: saved.fileId,
        userId: user ? user.id : "GUEST",
        fileName: saved.filename,
        filePath: saved.diskPath,
        publicUrl: saved.publicUrl,
        fileSize: saved.fileSize,
        mimeType: saved.mimeType,
        category: category,
      },
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully to secure vault",
      data: {
        id: documentRecord.id,
        file_id: documentRecord.id,
        filename: documentRecord.fileName,
        file_type: documentRecord.mimeType,
        upload_path: documentRecord.publicUrl,
        category: documentRecord.category,
        file_size: documentRecord.fileSize,
        created_at: documentRecord.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[Vault Upload Error]:", err);
    return NextResponse.json({ success: false, detail: err.message || "Upload failed" }, { status: 500 });
  }
}
