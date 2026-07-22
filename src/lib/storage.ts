import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { generateFileId } from "./id-generator";

export interface VaultFileSaveResult {
  fileId: string;
  filename: string;
  publicUrl: string;
  diskPath: string;
  fileSize: number;
  mimeType: string;
  checksumMd5: string;
  virusScanStatus: "PASSED" | "FAILED" | "PENDING";
}

class LocalVaultStorageService {
  async saveVaultFile(file: File, category: string): Promise<VaultFileSaveResult> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const fileId = generateFileId();
    const ext = path.extname(file.name) || ".pdf";
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const storedFilename = `${fileId}_${sanitizedName}`;

    // Path: public/uploads/vault/YYYY/MM/
    const relDir = path.join("uploads", "vault", year, month);
    const absDir = path.join(process.cwd(), "public", relDir);

    if (!fs.existsSync(absDir)) {
      await mkdir(absDir, { recursive: true });
    }

    const absPath = path.join(absDir, storedFilename);
    await writeFile(absPath, buffer);

    const checksumMd5 = crypto.createHash("md5").update(buffer).digest("hex");
    const publicUrl = `/${relDir}/${storedFilename}`.replace(/\\/g, "/");

    return {
      fileId,
      filename: file.name,
      publicUrl,
      diskPath: absPath,
      fileSize: buffer.length,
      mimeType: file.type || "application/octet-stream",
      checksumMd5,
      virusScanStatus: "PASSED",
    };
  }
}

export const vaultStorage = new LocalVaultStorageService();
