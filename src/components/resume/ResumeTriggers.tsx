'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { chrome } from '@/content/chrome';
import { whenIdle } from '@/lib/device';

/** The dialog and its styles' behavior live in their own chunk. */
const ResumeDialog = dynamic(() => import('@/components/resume/ResumeDialog'), { ssr: false });

const SELECTOR = 'a[data-resume-trigger]';

type Request = { trigger: HTMLAnchorElement };

/**
 * Tiny island: upgrades plain left clicks on any resume link to the preview
 * dialog. Modified clicks, middle clicks and no-JS go straight to the PDF.
 * The dialog chunk loads when the browser is idle or on first hover/focus; the preview
 * image is only fetched on hover/focus intent, so visitors who never reach for it skip it.
 */
export function ResumeTriggers() {
  const [load, setLoad] = useState(false);
  const [request, setRequest] = useState<Request | null>(null);

  useEffect(() => {
    const warm = () => {
      setLoad(true);
      document.removeEventListener('pointerover', onWarm);
      document.removeEventListener('focusin', onWarm);
    };
    const cancelIdle = whenIdle(warm, 4000);
    const onWarm = (e: Event) => {
      if (!(e.target as Element | null)?.closest?.(SELECTOR)) return;
      new Image().src = chrome.ui.resumeDialog.previewSrc;
      warm();
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const trigger = (e.target as Element | null)?.closest<HTMLAnchorElement>(SELECTOR);
      if (!trigger) return;
      e.preventDefault();
      setLoad(true);
      setRequest({ trigger });
    };
    document.addEventListener('pointerover', onWarm, { passive: true });
    document.addEventListener('focusin', onWarm);
    document.addEventListener('click', onClick);
    return () => {
      cancelIdle();
      document.removeEventListener('pointerover', onWarm);
      document.removeEventListener('focusin', onWarm);
      document.removeEventListener('click', onClick);
    };
  }, []);

  if (!load) return null;
  return (
    // If the chunk fails, fall back to what the link would have done.
    <ErrorBoundary onError={() => request && window.location.assign(request.trigger.href)}>
      <ResumeDialog request={request} />
    </ErrorBoundary>
  );
}
