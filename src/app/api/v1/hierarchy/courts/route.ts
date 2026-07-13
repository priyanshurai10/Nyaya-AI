import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'backend', 'data', 'court_hierarchy.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const courts = JSON.parse(fileContents);
    return NextResponse.json(courts);
  } catch (error) {
    console.error('Error reading court hierarchy data:', error);
    return NextResponse.json({ error: 'Failed to load court hierarchy data' }, { status: 500 });
  }
}
