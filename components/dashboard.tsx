'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Topbar from '@/components/topbar';
import StatsGrid from '@/components/stats-grid';
import LobsterHero from '@/components/lobster-hero';
import Leaderboard from '@/components/leaderboard';
import Shop from '@/components/shop';
import ChatPanel from '@/components/chat-panel';
import Footer from '@/components/footer';
import type { ChamberStats, LeaderboardUser } from '@/lib/types';
import { adjustTrust, readTrust, writeTrust } from '@/lib/storage';
import { analyzeMessage } from '@/lib/trust';
import { formatSol, safeNumber, shortWallet } from '@/lib/utils';
import { DONATION_ADDRESS, SHOP_ITEMS } from '@/lib/constants';
import { sendWithFallback, solToLamports } from '@/lib/solana';
import { useWallet } from '@solana/wallet-adapter-react';

type PaymentFeedback = {
  kind: 'success' | 'error' | 'info';
  text: string;
};

export default function Dashboard() {
  const wallet = useWallet();
  const connectedWallet = wallet.publicKey?.toBase58() ?? null;

  const [stats, setStats] = useState<ChamberStats | null>(null);
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [trust, setTrust] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<string>(new Date().toLocaleString());
  const [tempBoost, setTempBoost] = useState(0);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [feedback, setFeedback] = useState<PaymentFeedback | null>(null);

  useEffect(() => {
    if (!connectedWallet) {
      setTrust(0);
      return;
    }
    const next = readTrust(connectedWallet);
    setTrust(next);
  }, [connectedWallet]);

  async function refreshStats() {
    try {
      const [statsRes, leadersRes] = await Promise.all([
        axios.get('/api/chamber'),
        axios.get('/api/leaderboard')
      ]);

      setStats(statsRes.data);
      const rawItems = Array.isArray(leadersRes.data?.items) ? leadersRes.data.items : [];
      const normalized: LeaderboardUser[] = rawItems.map((entry: unknown) => {
        const user = (entry && typeof entry === 'object' ? entry : {}) as Record<string, unknown>;
        const walletValue = String(
          user.wallet ?? user.address ?? user.publicKey ?? user.pubkey ?? user.pubKey ?? user.key ?? ''
        );
        const username = String(user.username ?? user.handle ?? user.name ?? user.user ?? user.displayName ?? walletValue.slice(0, 8) ?? 'Unknown');
        const baseScore = safeNumber(
          user.trust ?? user.trustScore ?? user.baseScore ?? user.score ?? user.points ?? user.votes ?? user.rank_score,
          0
        );
        const trustScore = connectedWallet && walletValue && walletValue.toLowerCase() === connectedWallet.toLowerCase()
          ? baseScore + readTrust(connectedWallet)
          : baseScore;

        return {
          username,
          wallet: walletValue,
          baseScore,
          trustScore,
          status: trustScore > 300 ? '👑 King' : trustScore >= 100 ? '🦞 Noble' : '🐟 Peasant',
          raw: entry
        };
      });

      setLeaders(normalized);
      setLastRefresh(new Date().toLocaleString());
    } catch (error) {
      setFeedback({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Failed to refresh live data.'
      });
    }
  }

  useEffect(() => {
    refreshStats();
    const interval = window.setInterval(refreshStats, 15000);
    return () => window.clearInterval(interval);
  }, [connectedWallet]);

  useEffect(() => {
    if (!connectedWallet) return;
    const interval = window.setInterval(() => setTrust(readTrust(connectedWallet)), 1000);
    return () => window.clearInterval(interval);
  }, [connectedWallet]);

  function applyTrustAndRefresh(delta: number) {
    if (!connectedWallet) return trust;
    const next = adjustTrust(connectedWallet, delta);
    setTrust(next);
    return next;
  }

  async function sendPayment(amountSol: number, memo: string, trustGain?: number) {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      setFeedback({ kind: 'error', text: 'Connect Phantom or Solflare first.' });
      return;
    }

    setLoadingPayment(true);
    setFeedback({ kind: 'info', text: `Preparing ${memo} payment to ${shortWallet(DONATION_ADDRESS)}...` });

    try {
      const result = await sendWithFallback(wallet as unknown as { publicKey: any; sendTransaction: any }, solToLamports(amountSol));
      if (connectedWallet && typeof trustGain === 'number') {
        const next = applyTrustAndRefresh(trustGain);
        writeTrust(connectedWallet, next);
      }

      setTempBoost((prev) => prev + 35);
      window.setTimeout(() => setTempBoost(0), 1200);

      setFeedback({
        kind: 'success',
        text: `Payment confirmed: ${result.signature} via ${result.rpc}`
      });
    } catch (error) {
      setFeedback({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Transaction failed.'
      });
    } finally {
      setLoadingPayment(false);
    }
  }

  const currentTrust = trust;
  const lobsterSizeHint = useMemo(() => currentTrust, [currentTrust]);

  return (
    <div className="min-h-screen">
      <Topbar />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {feedback ? (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              feedback.kind === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : feedback.kind === 'error'
                  ? 'border-red-500/30 bg-red-500/10 text-red-200'
                  : 'border-orange-500/30 bg-orange-500/10 text-orange-200'
            }`}
          >
            {feedback.text}
          </div>
        ) : null}

        <StatsGrid stats={stats} updatedAt={lastRefresh} />

        <LobsterHero trust={lobsterSizeHint} tempBoost={tempBoost} />

        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <Leaderboard rows={leaders} connectedWallet={connectedWallet} />

          <Shop
            loading={loadingPayment}
            onPurchase={(itemId) => {
              const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
              if (!item) return;
              void sendPayment(item.priceSol, item.name, item.trustGain);
            }}
            onFeed={(amount) => {
              const trustGain = Math.floor(amount * 10);
              void sendPayment(amount, `Feed Lobster (${formatSol(amount)} SOL)`, trustGain);
            }}
            onDonate={() => void sendPayment(0.1, 'Creator donation', 0)}
          />
        </section>

        <ChatPanel
          connectedWallet={connectedWallet}
          currentTrust={currentTrust}
          onTrustChanged={(nextTrust) => setTrust(nextTrust)}
        />

        <Footer />
      </main>
    </div>
  );
}
