'use client';

import { useEffect, useRef, useState } from 'react';

import { chrome } from '@/content/chrome';

type Props = { email: string };

/**
 * Copies the address to the clipboard and announces it. When the clipboard
 * API is unavailable (insecure context, old browser) it selects the text so
 * the user can copy manually.
 */
export function CopyEmail({ email }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'fallback'>('idle');
  const textRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    window.clearTimeout(timer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard');
      // Some mobile Chromium builds leave writeText pending forever.
      await Promise.race([
        navigator.clipboard.writeText(email),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error('clipboard timeout')), 800);
        }),
      ]);
      setState('copied');
    } catch {
      selectText();
      setState('fallback');
    }
    timer.current = window.setTimeout(() => setState('idle'), 1500);
  };

  const selectText = () => {
    const el = textRef.current;
    if (!el) return;
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch {
      /* ignore */
    }
  };

  const label =
    state === 'copied'
      ? chrome.ui.copied
      : state === 'fallback'
        ? chrome.ui.copyFailed
        : chrome.ui.copyEmail;

  return (
    <span className="copy-email">
      <button type="button" className="btn btn-surface btn-small themed" onClick={copy}>
        {label}
      </button>
      <span ref={textRef} className="copy-email-text mono">
        {email}
      </span>
      <span className="sr-only" aria-live="polite" role="status">
        {state === 'copied' ? `${email} copied to clipboard` : ''}
        {state === 'fallback' ? 'Clipboard unavailable. Email address selected, press copy.' : ''}
      </span>
    </span>
  );
}
