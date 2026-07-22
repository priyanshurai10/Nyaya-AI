export interface LegalNotification {
  id: string;
  category: 'laws' | 'cases' | 'judgments' | 'system';
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  source_link?: string;
}

export const notificationStore: LegalNotification[] = [
  {
    id: "notif-1",
    category: "laws",
    title: "Bharatiya Nyaya Sanhita (BNS) 2023 Gazette Implementation Notice",
    message: "Ministry of Home Affairs enforces new criminal code replacing IPC 1860. Section 318 now governs cheating & financial fraud with mandatory digital evidence under BSA Section 61.",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    is_read: false,
    source_link: "/knowledge"
  },
  {
    id: "notif-2",
    category: "judgments",
    title: "Supreme Court Landmark Ruling on Tenant Eviction & Security Deposit",
    message: "Bench holds that landlords cannot illegally lock rented premises without due process under Rent Control Act. Summary refund of security deposit with 9% interest ordered.",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    is_read: false,
    source_link: "/judgments"
  },
  {
    id: "notif-3",
    category: "cases",
    title: "Upcoming Hearing Reminder — Delhi High Court",
    message: "Your property title hearing W.P.(C) 4102/2025 is scheduled in 48 hours in Courtroom 4. Ensure Section 63 BSA certificate is attached.",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    is_read: false,
    source_link: "/calendar"
  },
  {
    id: "notif-4",
    category: "laws",
    title: "Consumer Protection Act 2019 — E-Commerce Refund Rules Updated",
    message: "Central Consumer Protection Authority (CCPA) penalizes hidden drip pricing and mandatory 7-day auto refund for defective electronic items.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    is_read: true,
    source_link: "/academy"
  },
  {
    id: "notif-5",
    category: "system",
    title: "Nyaya AI Document OCR Vault Upgraded",
    message: "AI Document OCR now supports Bharatiya Sakshya Adhiniyam (BSA) Section 61 verification for PDF contracts and bank receipts.",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    is_read: true,
    source_link: "/evidence-vault"
  }
];
