import { CHAT_STORAGE_KEY, TRUST_STORAGE_PREFIX } from '@/lib/constants';
import type { ChatMessage } from '@/lib/types';

export function getTrustKey(wallet: string) {
  return `${TRUST_STORAGE_PREFIX}${wallet}`;
}

export function readTrust(wallet?: string | null) {
  if (typeof window === 'undefined' || !wallet) return 0;
  const raw = window.localStorage.getItem(getTrustKey(wallet));
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function writeTrust(wallet: string, value: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getTrustKey(wallet), String(value));
}

export function adjustTrust(wallet: string, delta: number) {
  const next = readTrust(wallet) + delta;
  writeTrust(wallet, next);
  return next;
}

export function readChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function writeChatMessages(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
}
