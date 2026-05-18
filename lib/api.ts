import axios from 'axios';
import type { ChamberStats, LeaderboardUser } from '@/lib/types';
import { safeNumber, safeText } from '@/lib/utils';
import { readTrust } from '@/lib/storage';
import { statusFromTrust } from '@/lib/trust';

const CHAMBER_URL = 'https://lobstarwilde.ai/chamber?x=connected';
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

function findNumberDeep(value: unknown, keys: string[]): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const nested = findNumberDeep(entry, keys);
      if (nested !== null) return nested;
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

function getFirstString(value: unknown, keys: string[], fallback = ''): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const nested = getFirstString(entry, keys, '');
      if (nested) return nested;
    }
    return fallback;
  }
  if (!value || typeof value !== 'object') return fallback;
  const obj = value as Record<string, unknown>;
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v;
  }
  for (const nested of Object.values(obj)) {
    const found = getFirstString(nested, keys, '');
    if (found) return found;
  }
  return fallback;
}

export async function fetchChamberStats(): Promise<ChamberStats> {
  const res = await axios.get(CHAMBER_URL, { timeout: 15000 });
  const raw = res.data;

  const activeMembers = findNumberDeep(raw, ['activeMembers', 'active_members', 'members', 'online', 'connected']) ?? 0;
  const totalVotes = findNumberDeep(raw, ['totalVotes', 'total_votes', 'votes']) ?? 0;
  const cast = findNumberDeep(raw, ['cast']) ?? 0;
  const pending = findNumberDeep(raw, ['pending']) ?? 0;
  const messages = findNumberDeep(raw, ['messages', 'messageCount', 'message_count']) ?? 0;
  const lastSeq = findNumberDeep(raw, ['lastSeq', 'last_seq', 'seq', 'sequence']) ?? 0;

  return { activeMembers, totalVotes, cast, pending, messages, lastSeq, raw };
}

function getBaseScore(user: Record<string, unknown>): number {
  const candidates = [
    user.trust,
    user.trustScore,
    user.baseScore,
    user.score,
    user.points,
    user.votes,
    user.rank_score
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
    if (typeof candidate === 'string' && candidate.trim() !== '' && Number.isFinite(Number(candidate))) {
      return Number(candidate);
    }
  }
  return 0;
}

function getWallet(user: Record<string, unknown>): string {
  return safeText(
    user.wallet ??
    user.address ??
    user.publicKey ??
    user.pubkey ??
    user.pubKey ??
    user.key,
    ''
  );
}

function getUsername(user: Record<string, unknown>, wallet: string): string {
  const raw =
    safeText(user.username, '') ||
    safeText(user.handle, '') ||
    safeText(user.name, '') ||
    safeText(user.user, '') ||
    safeText(user.displayName, '');
  return raw || (wallet ? wallet.slice(0, 8) : 'Unknown');
}

export async function fetchLeaderboard(wallet?: string | null): Promise<LeaderboardUser[]> {
  const res = await axios.get(LEADERBOARD_URL, { timeout: 20000 });
  const raw = res.data;
  const list = deepFindArrayOfObjects(raw);

  const currentTrust = wallet ? readTrust(wallet) : 0;

  return list.slice(0, 1000).map((entry) => {
    const user = (entry && typeof entry === 'object' ? entry : {}) as Record<string, unknown>;
    const userWallet = getWallet(user);
    const username = getUsername(user, userWallet);
    const baseScore = getBaseScore(user);
    const trustScore = userWallet && wallet && userWallet.toLowerCase() === wallet.toLowerCase()
      ? baseScore + currentTrust
      : baseScore;

    return {
      username,
      wallet: userWallet,
      baseScore,
      trustScore,
      status: statusFromTrust(trustScore),
      raw: entry
    };
  });
}
