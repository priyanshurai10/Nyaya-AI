import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from '../../store';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const item = notificationStore.find(n => n.id === params.id);
  if (item) {
    item.is_read = true;
  }
  return NextResponse.json({ success: true, message: "Notification marked as read" });
}
