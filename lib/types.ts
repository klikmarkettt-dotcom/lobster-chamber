export type ChamberStats = {
  activeMembers: number;
  totalVotes: number;
  cast: number;
  pending: number;
  messages: number;
  lastSeq: number;
  raw?: unknown;
};

export type LeaderboardUser = {
  username: string;
  wallet: string;
  baseScore: number;
  trustScore: number;
  status: '👑 King' | '🦞 Noble' | '🐟 Peasant';
  raw: unknown;
};

export type ChatMessage = {
  id: string;
  wallet: string;
  username: string;
  text: string;
  createdAt: number;
  analysis: string;
  trustDelta: number;
  upvotes: number;
  downvotes: number;
};

export type PaymentKind = 'shop' | 'feed' | 'donate';
