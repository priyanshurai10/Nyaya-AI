import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    const dataPath = path.join(process.cwd(), 'backend', 'data', 'law_guides.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(fileContents);

    if (category) {
      const categoryData = data[category];
      if (categoryData) {
        return NextResponse.json(categoryData);
      } else {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading law guides data:', error);
    return NextResponse.json({ error: 'Failed to load law guides data' }, { status: 500 });
  }
}
