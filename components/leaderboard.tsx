'use client';

import { useMemo, useState } from 'react';
import type { LeaderboardUser } from '@/lib/types';
import { shortWallet } from '@/lib/utils';

export default function Leaderboard({
  rows,
  connectedWallet
}: {
  rows: LeaderboardUser[];
  connectedWallet: string | null;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...rows].sort((a, b) => b.trustScore - a.trustScore);
    if (!q) return list;
    return list.filter((row) => {
      return (
        row.username.toLowerCase().includes(q) ||
        row.wallet.toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  const visible = filtered.slice(0, 200);

  return (
    <section className="glass rounded-3xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-orange-400">Leaderboard</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Top users with trust</h2>
        </div>
        <div className="w-full sm:max-w-sm">
          <label className="mb-1 block text-xs text-zinc-400">Search username or wallet</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
          />
        </div>
      </div>

      <div className="mt-4 overflow-auto rounded-2xl border border-zinc-800 scrollbar-thin">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-zinc-900 text-zinc-300">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Wallet</th>
              <th className="px-4 py-3">Trust Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Current User</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => {
              const isCurrent = connectedWallet && row.wallet && row.wallet.toLowerCase() === connectedWallet.toLowerCase();
              return (
                <tr key={`${row.wallet}-${index}`} className="border-t border-zinc-800 hover:bg-zinc-900/60">
                  <td className="px-4 py-3 text-zinc-500">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-white">{row.username}</td>
                  <td className="px-4 py-3 text-zinc-300">{shortWallet(row.wallet)}</td>
                  <td className="px-4 py-3 text-orange-300">{row.trustScore.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">{isCurrent ? 'You' : '—'}</td>
                </tr>
              );
            })}
            {!visible.length ? (
              <tr>
                <td className="px-4 py-6 text-zinc-400" colSpan={6}>
                  No leaderboard rows matched your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        Showing {visible.length} of {filtered.length} matching rows, from the live API feed.
      </p>
    </section>
  );
}
