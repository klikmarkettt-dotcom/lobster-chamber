import { NextResponse } from 'next/server';

const LEADERBOARD_URL = 'https://lobstarwilde.ai/api/leaderboard?limit=1000';

function deepFindArrayOfObjects(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    if (value.some((entry) => entry && typeof entry === 'object')) return value;
    return [];
  }

  if (!value || typeof value !== 'object') return [];

  const obj = value as Record<string, unknown>;
  const preferred = ['items', 'users', 'leaderboard', 'results', 'data', 'rows'];
  for (const key of preferred) {
    const candidate = obj[key];
    if (Array.isArray(candidate)) return candidate;
  }

  for (const candidate of Object.values(obj)) {
    const nested = deepFindArrayOfObjects(candidate);
    if (nested.length) return nested;
  }

  return [];
}

export async function GET() {
  try {
    const res = await fetch(LEADERBOARD_URL, { cache: 'no-store' });
    const raw = await res.json();
    const items = deepFindArrayOfObjects(raw).slice(0, 1000);
    return NextResponse.json(
      { items, raw },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch leaderboard.'
      },
      { status: 502 }
    );
  }
}
