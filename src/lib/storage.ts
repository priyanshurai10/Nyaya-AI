import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export interface StorageService {
  uploadFile(file: File, folder: string): Promise<string>;
}

class LocalStorageService implements StorageService {
  async uploadFile(file: File, folder: string): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name) || ".png";
    const filename = `${uuidv4()}${ext}`;
    
    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL
    return `/uploads/${folder}/${filename}`;
  }
}

// In the future, you could implement CloudinaryStorageService or S3StorageService here
// and conditionally export it based on environment variables.

export const storage = new LocalStorageService();
