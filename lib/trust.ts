import { CHAT_RULES } from '@/lib/constants';
import { clamp } from '@/lib/utils';

export function statusFromTrust(trust: number) {
  if (trust > 300) return '👑 King' as const;
  if (trust >= 100) return '🦞 Noble' as const;
  return '🐟 Peasant' as const;
}

export function computeChatTrustDelta(text: string) {
  const normalized = text.toLowerCase().trim();
  let delta = 1;

  if (CHAT_RULES.spamWords.some((word) => normalized.includes(word))) {
    delta = -5;
  } else if (CHAT_RULES.positiveWords.some((word) => normalized.includes(word))) {
    delta = 3;
  }

  if (text.length > 50) {
    delta -= 2;
  }

  return delta;
}

export function trustToLobsterSize(trust: number) {
  const normalized = clamp(trust, 0, 1000);
  return 100 + (normalized / 1000) * 200;
}

export function analyzeMessage(text: string) {
  const delta = computeChatTrustDelta(text);
  if (delta <= -5) return { delta, label: 'Flagged as spam/fud/scam' };
  if (delta >= 3) return { delta, label: 'Positive or helpful' };
  if (text.length > 50) return { delta, label: 'Long message penalty applied' };
  return { delta, label: 'Neutral message' };
}

export function formatTrustDelta(delta: number) {
  return delta > 0 ? `+${delta}` : String(delta);
}
