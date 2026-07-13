import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api-response';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// ── Types ──────────────────────────────────────────────────────────────────
interface SearchResult {
  type: string;
  title: string;
  summary: string;
  id: string;
  url: string;
  category?: string;
  score: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function safeRead(filePath: string): any[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function score(item: string, query: string): number {
  const lower = item.toLowerCase();
  const q = query.toLowerCase();
  if (lower === q) return 10;
  if (lower.startsWith(q)) return 7;
  if (lower.includes(` ${q}`)) return 5;
  if (lower.includes(q)) return 3;
  return 0;
}

function matches(fields: (string | undefined)[], q: string): number {
  return fields.reduce((best, field) => {
    if (!field) return best;
    const s = score(field, q);
    return s > best ? s : best;
  }, 0);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';
  const typeFilter = searchParams.get('type') || 'all';
  const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 50);

  if (!q || q.length < 2) {
    return successResponse({ data: [], total: 0, query: q, categories: [] });
  }

  const dataDir = path.join(process.cwd(), 'backend', 'data');
  const results: SearchResult[] = [];

  // ── 1. Knowledge Center ──────────────────────────────────────────────────
  if (typeFilter === 'all' || typeFilter === 'knowledge') {
    const items = safeRead(path.join(dataDir, 'knowledge.json'));
    for (const item of items) {
      const s = matches([item.title, item.summary, item.simple_explanation, item.category, item.act_name], q);
      if (s > 0) {
        results.push({
          type: 'knowledge',
          title: item.title || 'Knowledge Article',
          summary: item.summary || item.simple_explanation || '',
          id: item.id || '',
          url: `/knowledge/${item.id}`,
          category: item.category,
          score: s,
        });
      }
    }
  }

  // ── 2. Landmark Judgments ────────────────────────────────────────────────
  if (typeFilter === 'all' || typeFilter === 'judgment') {
    const items = safeRead(path.join(dataDir, 'judgments.json'));
    for (const item of items) {
      const s = matches([item.title, item.legal_issue, item.decision, item.category, item.court, item.petitioner, item.respondent], q);
      if (s > 0) {
        results.push({
          type: 'judgment',
          title: item.title || 'Judgment',
          summary: item.legal_issue || item.decision || '',
          id: item.id || '',
          url: `/judgments/${item.id}`,
          category: item.category,
          score: s,
        });
      }
    }
  }

  // ── 3. Courses & Lessons ─────────────────────────────────────────────────
  if (typeFilter === 'all' || typeFilter === 'course') {
    const items = safeRead(path.join(dataDir, 'academy_courses.json'));
    for (const item of items) {
      const s = matches([item.title, item.description, item.category], q);
      if (s > 0) {
        results.push({
          type: 'course',
          title: item.title || 'Course',
          summary: item.description || '',
          id: item.id || '',
          url: `/academy/course/${item.id}`,
          category: item.category,
          score: s + 1,
        });
      }
    }

    // Search lessons within each course JSON
    const lessonsDir = path.join(dataDir, 'lessons');
    if (fs.existsSync(lessonsDir)) {
      for (const item of items) {
        try {
          const courseFile = path.join(lessonsDir, `${item.id}.json`);
          if (!fs.existsSync(courseFile)) continue;
          const courseData = JSON.parse(fs.readFileSync(courseFile, 'utf8'));
          for (const mod of (courseData.modules || [])) {
            for (const les of (mod.lessons || [])) {
              const s = matches([les.title, les.content?.introduction, les.content?.summary], q);
              if (s > 0) {
                results.push({
                  type: 'lesson',
                  title: les.title,
                  summary: les.content?.summary || les.content?.introduction?.slice(0, 120) || '',
                  id: les.id,
                  url: `/academy/course/${item.id}?lesson=${les.id}`,
                  category: courseData.title,
                  score: s,
                });
              }
            }
          }
        } catch { /* skip if file is missing */ }
      }
    }
  }

  // ── 4. Court Hierarchy ───────────────────────────────────────────────────
  if (typeFilter === 'all' || typeFilter === 'court') {
    const items = safeRead(path.join(dataDir, 'court_hierarchy.json'));
    for (const item of items) {
      const s = matches([item.name, item.description, item.jurisdiction, item.type], q);
      if (s > 0) {
        results.push({
          type: 'court',
          title: item.name || 'Court',
          summary: item.description || item.jurisdiction || '',
          id: item.id || '',
          url: `/journey?tab=court-hierarchy`,
          score: s,
        });
      }
    }
  }

  // ── 5. Law Guides ────────────────────────────────────────────────────────
  if (typeFilter === 'all' || typeFilter === 'guide') {
    const items = safeRead(path.join(dataDir, 'law_guides.json'));
    for (const item of items) {
      const s = matches([item.title, item.description, item.category, item.area_of_law], q);
      if (s > 0) {
        results.push({
          type: 'guide',
          title: item.title || 'Law Guide',
          summary: item.description || item.summary || '',
          id: item.id || '',
          url: `/journey?guide=${item.id}`,
          category: item.category,
          score: s,
        });
      }
    }
  }

  // ── 6. Constitution & Legal Acts (from knowledge) ────────────────────────
  if (typeFilter === 'all' || typeFilter === 'constitution') {
    const items = safeRead(path.join(dataDir, 'knowledge.json'));
    const constitutionTerms = ['constitution', 'article', 'fundamental rights', 'bns', 'bnss', 'bsa', 'ipc', 'crpc', 'evidence'];
    const matchesConstitution = constitutionTerms.some(t => q.toLowerCase().includes(t));
    if (matchesConstitution) {
      for (const item of items) {
        if (item.act_name || item.category?.toLowerCase().includes('constitution') || item.category?.toLowerCase().includes('bns')) {
          const s = matches([item.title, item.act_name, item.summary, item.category], q);
          if (s > 0) {
            results.push({
              type: 'constitution',
              title: item.title || 'Legal Provision',
              summary: item.summary || '',
              id: item.id || '',
              url: `/knowledge/${item.id}`,
              category: item.act_name || item.category,
              score: s + 2,
            });
          }
        }
      }
    }
  }

  // ── Sort & Deduplicate & Limit ───────────────────────────────────────────
  const seen = new Set<string>();
  const unique = results
    .sort((a, b) => b.score - a.score)
    .filter(r => {
      const key = `${r.type}:${r.id}:${r.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return successResponse({
    data: unique.slice(0, limit),
    total: unique.length,
    query: q,
    categories: Array.from(new Set(unique.map(r => r.type))),
  });
}
