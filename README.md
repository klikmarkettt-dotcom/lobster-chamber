# Lobster Chamber

Real-time Next.js 14+ dashboard with live chamber stats, leaderboard, wallet payments, trust scoring, feed actions, and chat analysis.

## WSL / Ubuntu setup

```bash
sudo apt update
sudo apt install -y curl git
node -v || true
npm -v || true
```

Install Node.js 20+ if needed:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Install and run:

```bash
npm install
npm run dev
```

Build for Vercel:

```bash
npm run build
```

## Environment variables

Create `.env.local` if needed:

```bash
NEXT_PUBLIC_SOLANA_RPC_URLS=https://api.mainnet-beta.solana.com,https://solana-rpc.publicnode.com,https://rpc.ankr.com/solana
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

## Notes

- Live data is fetched from the provided Lobstar Wilde endpoints through App Router route handlers.
- Trust score is stored locally in `localStorage` per wallet for the demo.
- SOL transfers use `SystemProgram.transfer` and wallet adapter.
