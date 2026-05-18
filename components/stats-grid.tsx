'use client';

import type { ChamberStats } from '@/lib/types';

const cards = [
  { label: 'Active Members', key: 'activeMembers' },
  { label: 'Total Votes', key: 'totalVotes' },
  { label: 'Cast', key: 'cast' },
  { label: 'Pending', key: 'pending' },
  { label: 'Messages', key: 'messages' },
  { label: 'Last Seq', key: 'lastSeq' }
] as const;

export default function StatsGrid({ stats, updatedAt }: { stats: ChamberStats | null; updatedAt: string }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.key} className="glass rounded-2xl p-5">
          <p className="text-sm text-zinc-400">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {stats ? (stats[card.key] ?? 0).toLocaleString() : '—'}
          </p>
        </div>
      ))}
      <div className="glass rounded-2xl p-5 md:col-span-2 xl:col-span-3">
        <p className="text-sm text-zinc-400">Last refresh</p>
        <p className="mt-2 text-lg text-zinc-200">{updatedAt}</p>
      </div>
    </section>
  );
}
