import type { Metadata } from 'next';
import '@solana/wallet-adapter-react-ui/styles.css';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lobster Chamber',
  description: 'Real-time Lobster Chamber dashboard with live stats, leaderboard, shop, feed and chat trust analysis.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
