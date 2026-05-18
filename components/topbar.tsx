'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-orange-400">Lobster Chamber</p>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Real-time Trust Dashboard</h1>
        </div>
        <div className="scale-95 sm:scale-100">
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
