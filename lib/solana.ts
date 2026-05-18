import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  type Commitment
} from '@solana/web3.js';
import { DONATION_ADDRESS } from '@/lib/constants';

const DEFAULT_RPC_URLS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-rpc.publicnode.com',
  'https://rpc.ankr.com/solana'
];

export function getRpcUrls() {
  const envValue = process.env.NEXT_PUBLIC_SOLANA_RPC_URLS;
  const fromEnv = envValue
    ? envValue.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
  return [...fromEnv, ...DEFAULT_RPC_URLS].filter((value, index, array) => array.indexOf(value) === index);
}

export function getCommitment(): Commitment {
  return 'confirmed';
}

export async function createPaymentTransaction(params: {
  payer: PublicKey;
  lamports: number;
}) {
  const recipient = new PublicKey(DONATION_ADDRESS);
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: params.payer,
      toPubkey: recipient,
      lamports: params.lamports
    })
  );
  return tx;
}

export function solToLamports(sol: number) {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

export async function sendWithFallback(
  sender: { publicKey: PublicKey; sendTransaction: (tx: Transaction, connection: Connection) => Promise<string> },
  lamports: number
) {
  const payer = sender.publicKey;
  const tx = await createPaymentTransaction({ payer, lamports });

  let lastError: unknown = null;
  const urls = getRpcUrls();

  for (const url of urls) {
    const connection = new Connection(url, getCommitment());
    try {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(getCommitment());
      tx.feePayer = payer;
      tx.recentBlockhash = blockhash;

      const signature = await sender.sendTransaction(tx, connection, { skipPreflight: false, preflightCommitment: getCommitment() });

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        getCommitment()
      );

      return { signature, rpc: url };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Transaction failed on all RPCs.');
}
