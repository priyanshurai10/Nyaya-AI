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

export const calendarEventsStore: CalendarEvent[] = [];
