import { NextResponse } from 'next/server';

const CHAMBER_URL = 'https://lobstarwilde.ai/chamber?x=connected';

function findNumberDeep(value: unknown, keys: string[]): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findNumberDeep(entry, keys);
      if (found !== null) return found;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;

  const obj = value as Record<string, unknown>;
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  }

  for (const nested of Object.values(obj)) {
    const found = findNumberDeep(nested, keys);
    if (found !== null) return found;
  }
  return null;
}

export async function GET() {
  try {
    const res = await fetch(CHAMBER_URL, { cache: 'no-store' });
    const raw = await res.json();

    const payload = {
      activeMembers: findNumberDeep(raw, ['activeMembers', 'active_members', 'members', 'online', 'connected']) ?? 0,
      totalVotes: findNumberDeep(raw, ['totalVotes', 'total_votes', 'votes']) ?? 0,
      cast: findNumberDeep(raw, ['cast']) ?? 0,
      pending: findNumberDeep(raw, ['pending']) ?? 0,
      messages: findNumberDeep(raw, ['messages', 'messageCount', 'message_count']) ?? 0,
      lastSeq: findNumberDeep(raw, ['lastSeq', 'last_seq', 'seq', 'sequence']) ?? 0,
      raw
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch chamber stats.'
      },
      { status: 502 }
    );
  }
}
