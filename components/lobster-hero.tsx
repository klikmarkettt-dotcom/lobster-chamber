'use client';

import { trustToLobsterSize } from '@/lib/trust';

export default function LobsterHero({
  trust,
  tempBoost
}: {
  trust: number;
  tempBoost: number;
}) {
  const size = Math.round(trustToLobsterSize(trust) + tempBoost);

  return (
    <section className="glass rounded-3xl p-6 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        <p className="text-xs uppercase tracking-[0.35em] text-orange-400">Lobster animation</p>
        <div
          className="flex items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 shadow-glow transition-all duration-500 animate-bounce"
          style={{ width: size, height: size }}
        >
          <span style={{ fontSize: Math.max(54, size * 0.48) }} aria-label="lobster">
            🦞
          </span>
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Trust Score: {trust.toLocaleString()}</p>
          <p className="text-sm text-zinc-400">Lobster grows from 100px to 300px as trust reaches 1000.</p>
        </div>
      </div>
    </section>
  );
}
