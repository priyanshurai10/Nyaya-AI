import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "nyaya_ai_super_secret_32_byte_key_2026!";
const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypt sensitive string data (Aadhaar/PAN) with AES-256-GCM
 */
export function encryptData(text: string | null | undefined): string | null {
  if (!text || text.trim() === "") return null;
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}

/**
 * Decrypt sensitive string data (Aadhaar/PAN) with AES-256-GCM
 */
export function decryptData(cipherText: string | null | undefined): string | null {
  if (!cipherText || !cipherText.includes(":")) return cipherText || null;
  try {
    const [ivHex, authTagHex, encryptedText] = cipherText.split(":");
    if (!ivHex || !authTagHex || !encryptedText) return cipherText;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

/**
 * Mask Aadhaar number for display (e.g. XXXX-XXXX-1234)
 */
export function maskAadhaar(aadhaar: string | null | undefined): string {
  if (!aadhaar) return "Not Provided";
  const clean = aadhaar.replace(/\D/g, "");
  if (clean.length < 4) return "XXXX-XXXX-XXXX";
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

/**
 * Mask PAN number for display (e.g. ABCDE****F)
 */
export function maskPan(pan: string | null | undefined): string {
  if (!pan) return "Not Provided";
  const clean = pan.trim().toUpperCase();
  if (clean.length < 10) return "XXXXX****X";
  return `${clean.slice(0, 5)}****${clean.slice(-1)}`;
}
