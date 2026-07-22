import { v4 as uuidv4 } from "uuid";

function getFormattedDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function getRandomHex(length = 6): string {
  return uuidv4().replace(/-/g, "").substring(0, length).toUpperCase();
}

export function generatePaymentId(): string {
  return `NYA-PAY-${getFormattedDate()}-${getRandomHex()}`;
}

export function generateConsultationId(): string {
  return `NYA-CON-${getFormattedDate()}-${getRandomHex()}`;
}

export function generateFileId(): string {
  return `NYA-DOC-${getFormattedDate()}-${getRandomHex()}`;
}

export function generateNotificationId(): string {
  return `NYA-NOT-${getFormattedDate()}-${getRandomHex()}`;
}

export function generateCaseId(): string {
  return `NYA-CAS-${getFormattedDate()}-${getRandomHex()}`;
}
