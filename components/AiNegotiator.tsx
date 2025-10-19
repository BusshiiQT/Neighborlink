// components/AiNegotiator.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AiNegotiatorProps {
  title: string;
  price: number | null;
  sellerName: string;
  /** Where to go after sending (demo). Defaults to /messages */
  redirectTo?: string;
}

export default function AiNegotiator({
  title,
  price,
  sellerName,
  redirectTo = '/messages',
}: AiNegotiatorProps) {
  const [message, setMessage] = useState('');
  const [autoFill, setAutoFill] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const priceText = price ? `$${price}` : 'the current price';
  const opener = `Hi ${sellerName}, I'm interested in “${title}”. Is it still available?`;
  const counter = `Hi ${sellerName}, I like “${title}”. Would you consider ${
    price ? `$${Math.max(price - 50, 0)}` : 'a small discount'
  } if I can pick up soon?`;

  function useOpener() {
    setMessage(opener);
  }

  function useCounter() {
    setMessage(counter);
  }

  async function copyToClipboard() {
    const text = (message || opener).trim();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  async function handleSend() {
    let text = message.trim();
    if (!text && autoFill) {
      text = opener;
    }
    if (!text) return;

    // Demo behavior: clear the box, simulate a send, then navigate to messages.
    setSending(true);
    setMessage('');
    // In a real app, you'd create/find a thread here, then push(`/messages/${threadId}`)
    setTimeout(() => {
      router.push(redirectTo);
    }, 250);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
        Message the seller (demo)
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={useOpener}
          className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-base font-medium text-slate-900"
        >
          Suggest opener
        </button>
        <button
          type="button"
          onClick={useCounter}
          className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-base font-medium text-slate-900"
        >
          Suggest counteroffer
        </button>
        <div className="ml-auto text-sm md:text-base text-slate-700">
          Current price: <span className="font-semibold text-slate-900">{priceText}</span>
        </div>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        placeholder={`Type your message to ${sellerName}…`}
        className="w-full text-[16px] md:text-[17px] leading-7 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 p-4 bg-white placeholder:text-slate-400 text-slate-900"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>

        <button
          type="button"
          onClick={copyToClipboard}
          className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold"
        >
          {copied ? 'Copied!' : 'Copy message'}
        </button>

        <label className="flex items-center gap-2 ml-auto text-sm md:text-base text-slate-800">
          <input
            type="checkbox"
            className="h-4 w-4 accent-amber-600"
            checked={autoFill}
            onChange={(e) => setAutoFill(e.target.checked)}
          />
          Auto-fill opener if empty
        </label>
      </div>
    </div>
  );
}
