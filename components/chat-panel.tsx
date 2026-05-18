'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChatMessage } from '@/lib/types';
import { analyzeMessage, formatTrustDelta } from '@/lib/trust';
import { adjustTrust, readChatMessages, readTrust, writeChatMessages } from '@/lib/storage';

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatPanel({
  connectedWallet,
  currentTrust,
  onTrustChanged
}: {
  connectedWallet: string | null;
  currentTrust: number;
  onTrustChanged: (nextTrust: number) => void;
}) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMessages(readChatMessages());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeChatMessages(messages);
  }, [messages, loaded]);

  const analysis = useMemo(() => analyzeMessage(text), [text]);

  function persistTrustDelta(delta: number) {
    if (!connectedWallet) return;
    const next = adjustTrust(connectedWallet, delta);
    onTrustChanged(next);
  }

  function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed || !connectedWallet) return;

    const nextMessage: ChatMessage = {
      id: uid(),
      wallet: connectedWallet,
      username: `Wallet ${connectedWallet.slice(0, 4)}…${connectedWallet.slice(-4)}`,
      text: trimmed,
      createdAt: Date.now(),
      analysis: analysis.label,
      trustDelta: analysis.delta,
      upvotes: 0,
      downvotes: 0
    };

    setMessages((prev) => [nextMessage, ...prev]);
    persistTrustDelta(analysis.delta);
    setText('');
  }

  function vote(messageId: string, direction: 1 | -1) {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId) return message;
        const updated = {
          ...message,
          upvotes: message.upvotes + (direction === 1 ? 1 : 0),
          downvotes: message.downvotes + (direction === -1 ? 1 : 0)
        };

        if (connectedWallet && message.wallet.toLowerCase() === connectedWallet.toLowerCase()) {
          persistTrustDelta(direction);
        }

        return updated;
      })
    );
  }

  return (
    <section className="glass rounded-3xl p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-orange-400">Chat analyzer</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Rule-based trust AI</h2>
        </div>
        <div className="text-sm text-zinc-400">
          Current trust: <span className="text-orange-300">{currentTrust.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.5fr_0.5fr]">
        <div className="rounded-2xl border border-zinc-800 p-4">
          <label className="mb-2 block text-sm text-zinc-300">Message</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={connectedWallet ? 'Write a message...' : 'Connect wallet to chat...'}
            disabled={!connectedWallet}
            rows={4}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-400">
              AI result: <span className="text-zinc-200">{analysis.label}</span> ({formatTrustDelta(analysis.delta)})
            </p>
            <button
              onClick={sendMessage}
              disabled={!connectedWallet || !text.trim()}
              className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-zinc-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Post message
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Rules</p>
          <ul className="mt-2 space-y-2 text-sm text-zinc-300">
            <li>Spam/fud/scam words: -5</li>
            <li>Helpful words: +3</li>
            <li>Long message (&gt;50 chars): -2</li>
            <li>Otherwise: +1</li>
          </ul>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {messages.length ? (
          messages.map((message) => (
            <div key={message.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-white">{message.username}</p>
                  <p className="text-xs text-zinc-500">{new Date(message.createdAt).toLocaleString()}</p>
                </div>
                <p className="text-sm text-orange-300">Trust change: {formatTrustDelta(message.trustDelta)}</p>
              </div>
              <p className="mt-3 text-sm text-zinc-200">{message.text}</p>
              <p className="mt-2 text-xs text-zinc-400">{message.analysis}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => vote(message.id, 1)}
                  className="rounded-lg border border-zinc-800 px-3 py-1 text-sm text-zinc-200 transition hover:border-orange-500 hover:text-orange-300"
                >
                  👍 {message.upvotes}
                </button>
                <button
                  onClick={() => vote(message.id, -1)}
                  className="rounded-lg border border-zinc-800 px-3 py-1 text-sm text-zinc-200 transition hover:border-orange-500 hover:text-orange-300"
                >
                  👎 {message.downvotes}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
            No messages yet. Post something to start the trust analysis.
          </div>
        )}
      </div>
    </section>
  );
}
