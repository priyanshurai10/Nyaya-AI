import { NextRequest, NextResponse } from 'next/server';
import { calendarEventsStore, CalendarEvent } from './store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: calendarEventsStore
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, event_type, event_date, court, case_number, notes } = body;

    if (!title || !event_date) {
      return NextResponse.json({ success: false, detail: "Title and Event Date are required." }, { status: 400 });
    }

    const newEvent: CalendarEvent = {
      id: `cal-${Date.now()}`,
      title: title.trim(),
      type: event_type || 'hearing',
      date: event_date,
      court: court || "District Court",
      case_number: case_number || "",
      notes: notes || "",
      reminder_whatsapp: true,
      created_at: new Date().toISOString()
    };

    calendarEventsStore.unshift(newEvent);

    return NextResponse.json({
      success: true,
      message: "Event successfully added to Litigation Calendar",
      data: newEvent
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: err.message || "Failed to add event" }, { status: 500 });
  }
}
