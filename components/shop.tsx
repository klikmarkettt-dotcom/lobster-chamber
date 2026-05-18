'use client';

import { FEED_OPTIONS, SHOP_ITEMS } from '@/lib/constants';
import { formatSol } from '@/lib/utils';

export default function Shop({
  onPurchase,
  onFeed,
  onDonate,
  loading
}: {
  onPurchase: (itemId: number) => void;
  onFeed: (amount: number) => void;
  onDonate: () => void;
  loading: boolean;
}) {
  return (
    <section className="glass rounded-3xl p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-orange-400">Shop</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">Food items</h2>
      </div>

      <div className="mt-4 grid gap-3">
        {SHOP_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onPurchase(item.id)}
            disabled={loading}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-left transition hover:border-orange-500/50 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-medium text-white">{item.name}</p>
                <p className="text-sm text-zinc-400">Trust gain: +{item.trustGain}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-orange-300">{formatSol(item.priceSol)} SOL</p>
                <p className="text-xs text-zinc-500">Tap to pay</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-800 p-4">
        <p className="text-sm text-zinc-300">🍽️ Feed the Lobster</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {FEED_OPTIONS.map((amount) => (
            <button
              key={amount}
              disabled={loading}
              onClick={() => onFeed(amount)}
              className="rounded-xl border border-orange-500/25 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-200 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formatSol(amount)} SOL
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-500">Trust boost = amount × 10, rounded down.</p>
      </div>

      <button
        onClick={onDonate}
        disabled={loading}
        className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        ❤️ Donate to Creator (0.1 SOL)
      </button>

      <p className="mt-3 text-xs text-zinc-500">All payments go to the fixed donation address.</p>
    </section>
  );
}
