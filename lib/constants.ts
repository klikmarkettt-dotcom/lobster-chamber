export const DONATION_ADDRESS = 'Ghz2RotTtZKJeUFFNVfYV8NrB6TW5ZkJKQGcVYx31PvD';

export const SHOP_ITEMS = [
  { id: 1, name: '🍎 Apple', priceSol: 0.1, trustGain: 5 },
  { id: 2, name: '🍌 Banana', priceSol: 0.12, trustGain: 6 },
  { id: 3, name: '🥕 Carrot', priceSol: 0.09, trustGain: 4 },
  { id: 4, name: '🥦 Broccoli', priceSol: 0.15, trustGain: 7 },
  { id: 5, name: '🍅 Tomato', priceSol: 0.08, trustGain: 3 },
  { id: 6, name: '🍉 Watermelon', priceSol: 0.2, trustGain: 10 },
  { id: 7, name: '🥔 Potato', priceSol: 0.07, trustGain: 2 },
  { id: 8, name: '🍞 Bread', priceSol: 0.11, trustGain: 5 },
  { id: 9, name: '🥣 Soup', priceSol: 0.18, trustGain: 8 },
  { id: 10, name: '🦞 Lobster Delight', priceSol: 0.5, trustGain: 25 }
] as const;

export const FEED_OPTIONS = [0.05, 0.1, 0.5, 1] as const;

export const CHAT_RULES = {
  spamWords: ['spam', 'fud', 'scam', 'rug', 'bot', 'pump', 'dump'],
  positiveWords: ['great', 'thanks', 'analysis', 'good', 'love', 'awesome', 'helpful', 'strong']
} as const;

export const TRUST_STORAGE_PREFIX = 'lobster-chamber:trust:';
export const CHAT_STORAGE_KEY = 'lobster-chamber:chat:messages';
