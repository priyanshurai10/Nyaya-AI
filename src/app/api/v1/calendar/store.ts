export interface CalendarEvent {
  id: string;
  title: string;
  type: 'hearing' | 'filing' | 'notice_deadline' | 'rti_deadline' | 'consultation';
  date: string; // YYYY-MM-DD
  court?: string;
  case_number?: string;
  notes?: string;
  reminder_whatsapp?: boolean;
  created_at: string;
}

export const calendarEventsStore: CalendarEvent[] = [
  {
    id: "cal-101",
    title: "Delhi High Court — Property Dispute Preliminary Hearing",
    type: "hearing",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    court: "Delhi High Court, Courtroom 4",
    case_number: "W.P.(C) 4102/2025",
    notes: "Present original title deeds and mutation records before the bench.",
    reminder_whatsapp: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: "cal-102",
    title: "Rejoinder Filing Deadline under Order 8 Rule 9 CPC",
    type: "filing",
    date: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    court: "District & Sessions Court, Saket",
    case_number: "CS(COMM) 189/2024",
    notes: "File counter-affidavit along with Section 63 BSA certificate for electronic logs.",
    reminder_whatsapp: false,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "cal-103",
    title: "Statutory Legal Notice 15-Day Expiry Deadline",
    type: "notice_deadline",
    date: new Date(Date.now() + 86400000 * 9).toISOString().split("T")[0],
    notes: "If landlord fails to refund security deposit by this date, file CPC Order 37 Summary Suit.",
    reminder_whatsapp: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "cal-104",
    title: "RTI First Appeal Submission to Public Information Officer (PIO)",
    type: "rti_deadline",
    date: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
    notes: "Submit 1st Appeal under Section 19(1) of RTI Act 2005 for non-furnishing of municipal land records.",
    reminder_whatsapp: false,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];
