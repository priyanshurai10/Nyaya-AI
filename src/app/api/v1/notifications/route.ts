import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from './store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: notificationStore
  });
}
