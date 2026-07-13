import { successResponse, errorResponse } from '@/lib/api-response';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    const dataPath = path.join(process.cwd(), 'backend', 'data', 'knowledge.json');
    if (!fs.existsSync(dataPath)) {
      return errorResponse('Knowledge data not found', 404);
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    let data = JSON.parse(fileContent);

    if (category && category !== 'all' && category !== 'bookmarks') {
      data = data.filter((item: any) => item.category.toLowerCase() === category.toLowerCase());
    }

    if (query) {
      const q = query.toLowerCase();
      data = data.filter((item: any) => 
        (item.title && item.title.toLowerCase().includes(q)) || 
        (item.content && item.content.toLowerCase().includes(q)) || 
        (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(q))) ||
        (item.simple_explanation && item.simple_explanation.toLowerCase().includes(q)) ||
        (item.summary && item.summary.toLowerCase().includes(q))
      );
    }

    return successResponse(data);
  } catch (error: any) {
    console.error('Error fetching knowledge data:', error);
    return errorResponse('Failed to fetch knowledge data', 500);
  }
}
