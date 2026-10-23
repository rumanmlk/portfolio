'use client';

import { useEffect, useRef, useState } from 'react';

import { chrome } from '@/content/chrome';
import { getLenis } from '@/lib/scroll';

const ui = chrome.ui.resumeDialog;

type Props = { request: { trigger: HTMLAnchorElement } | null };

/** Locks page scroll (Lenis and native) and returns a function that restores it exactly. */
function lockScroll(): () => void {
  const root = document.documentElement;
  const previous = root.style.overflow;
  getLenis()?.stop();
  root.style.overflow = 'hidden';
  return () => {
    root.style.overflow = previous;
    getLenis()?.start();
  };
}

/**
 * Native modal <dialog> with a preview of the resume. The image is inserted on
 * the first open only; the download link works even if it fails to load.
 */
export default function ResumeDialog({ request }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement | null>(null);
  const unlock = useRef<(() => void) | null>(null);
  const href = request?.trigger.getAttribute('href') ?? '';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = dialog.current;
    if (!request || !el) return;
    trigger.current = request.trigger;
    if (!el.open) {
      el.showModal();
      unlock.current = lockScroll();
    }
  }, [request]);

  // Release the lock if the component unmounts while open.
  useEffect(
    () => () => {
      unlock.current?.();
      unlock.current = null;
    },
    [],
  );

  const onClose = () => {
    unlock.current?.();
    unlock.current = null;
    trigger.current?.focus();
  };

  return (
    <dialog
      ref={dialog}
      className="resume-dialog"
      data-lenis-prevent
      aria-labelledby="resume-dialog-title"
      onClose={onClose}
      onClick={(e) => {
        // The dialog has no padding, so a hit on the element itself is the backdrop.
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="resume-dialog-inner">
        <div className="resume-dialog-head">
          <h2 id="resume-dialog-title" className="sticker sticker-pixel resume-dialog-title">
            {ui.title}
          </h2>
          <button
            type="button"
            className="resume-dialog-close frame"
            aria-label={ui.close}
            onClick={() => dialog.current?.close()}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2.5" fill="none" />
            </svg>
          </button>
        </div>

        <div className="resume-dialog-body" tabIndex={0} role="region" aria-label={ui.bodyLabel}>
          {request && !failed ? (
            // eslint-disable-next-line @next/next/no-img-element -- static, pre-optimized preview
            <img
              src={ui.previewSrc}
              alt={ui.alt}
              width={1600}
              height={2072}
              decoding="async"
              onError={() => setFailed(true)}
            />
          ) : null}
          {failed ? (
            <p className="resume-dialog-error mono" role="status">
              {ui.previewFailed}
            </p>
          ) : null}
        </div>

        <div className="resume-dialog-foot">
          <div className="resume-dialog-actions">
            <a href={href} download={ui.filename} className="btn btn-accent">
              {ui.download}
            </a>
            <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-surface">
              {ui.openTab}
            </a>
          </div>
          <p className="mono-sm text-muted">{ui.hint}</p>
        </div>
      </div>
    </dialog>
  );
}
