import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'backend', 'data', 'judgments.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error reading judgments data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch judgments data' },
      { status: 500 }
    );
  }
}
