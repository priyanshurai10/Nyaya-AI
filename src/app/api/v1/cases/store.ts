export interface CaseItem {
  id: string;
  title: string;
  category: string;
  court?: string;
  status: 'active' | 'closed';
  summary?: string;
  type?: string;
  next_hearing?: string | null;
  created_at: string;
}

export const casesStore: CaseItem[] = [
  {
    id: "CASE-2026-001",
    title: "Tenant Deposit Recovery vs Landlord",
    category: "property",
    type: "Civil Rent Dispute",
    court: "Rent Control Tribunal, Saket",
    status: "active",
    summary: "Petition filed under Rent Control Act for refund of ₹60,000 security deposit withheld without justification.",
    next_hearing: new Date(Date.now() + 86400000 * 4).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    id: "CASE-2026-002",
    title: "Defective Smartphone Refund — Consumer Complaint",
    category: "consumer",
    type: "Consumer Protection",
    court: "District Consumer Redressal Forum",
    status: "active",
    summary: "Complaint filed under Consumer Protection Act 2019 demanding full refund of ₹45,000 plus compensation.",
    next_hearing: new Date(Date.now() + 86400000 * 11).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: "CASE-2026-003",
    title: "Employment Salary Dues Notice",
    category: "labour",
    type: "Labour Dispute",
    court: "Labour Commissioner Office",
    status: "closed",
    summary: "Settled via conciliation. Former employer paid ₹1,20,000 pending salary dues in full.",
    next_hearing: null,
    created_at: new Date(Date.now() - 86400000 * 45).toISOString()
  }
];
