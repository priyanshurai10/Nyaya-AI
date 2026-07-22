import { NextRequest, NextResponse } from 'next/server';
import { calendarEventsStore } from '../store';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const index = calendarEventsStore.findIndex(e => e.id === params.id);
  if (index !== -1) {
    calendarEventsStore.splice(index, 1);
  }
  return NextResponse.json({ success: true, message: "Calendar event removed successfully" });
}
