import { NextResponse } from 'next/server';
import { vaultItems } from './store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: vaultItems
  });
}
