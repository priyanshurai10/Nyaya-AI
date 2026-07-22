import { NextRequest, NextResponse } from 'next/server';
import { vaultItems } from '../store';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const index = vaultItems.findIndex(item => item.id === params.id);
  if (index !== -1) {
    vaultItems.splice(index, 1);
  }
  return NextResponse.json({ success: true, message: "File deleted from vault" });
}
