'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IntroLoading } from '@/components/intro/IntroLoading';
import { focusPageHeading, useIntroState } from '@/components/intro/useIntroState';
import { chrome } from '@/content/chrome';
import { loadAnimate } from '@/lib/animate';
import { EASE } from '@/lib/motion';

const TRAVEL_S = 0.8;
const BG_FADE_S = 0.4;

/** The scene is client-only and renders after the loading screen, so it loads in its own chunk. */
const IntroScene = dynamic(
  () => import('@/components/intro/IntroScene').then((m) => m.IntroScene),
  {
    ssr: false,
  },
);

/** Picks the avatar slot the overlay avatar travels into (sidebar or mobile header). */
function landingTarget(): SVGSVGElement | null {
  const candidates = Array.from(document.querySelectorAll<SVGSVGElement>('.avatar-landing svg'));
  return (
    candidates.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }) ?? null
  );
}

export function IntroSequence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const lastPercent = useRef(-1);
  const sceneRequested = useRef(false);

  const onProgress = useCallback((p: number) => {
    const percent = Math.round(p * 100);
    if (percent !== lastPercent.current) {
      lastPercent.current = percent;
      if (barRef.current) barRef.current.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      if (labelRef.current) labelRef.current.textContent = `${percent}%`;
      barRef.current?.parentElement?.setAttribute('aria-valuenow', String(percent));
    }
    // Warm the scene chunk once the bar is mostly done, not during first paint.
    if (!sceneRequested.current && p >= 0.7) {
      sceneRequested.current = true;
      void import('@/components/intro/IntroScene');
    }
  }, []);

  const { phase, beginExit, finish, didPresent } = useIntroState({ onProgress });

  // Once JS is alive the overlay is displayed by this class (not by data-intro)
  // and the pure-CSS 6s failsafe is cancelled.
  const [live, setLive] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setLive(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    // Never focus the overlay when this visit skipped the sequence — that
    // steals first Tab from the skip link after unmount.
    if (!didPresent.current) return;
    if (phase === 'scene') skipRef.current?.focus({ preventScroll: true });
    else if (phase === 'loading') rootRef.current?.focus({ preventScroll: true });
  }, [phase, didPresent]);

  // Restore page focus only after a real overlay session ends (B11).
  // Skipping an already-seen intro must not steal first Tab from the skip link.
  useEffect(() => {
    if (phase !== 'done' || !didPresent.current) return;
    focusPageHeading();
  }, [phase, didPresent]);

  // Keep Tab inside the overlay. Drop the trap on exit so heading restore can stick.
  // Do not use inert on #site (delays LCP).
  useEffect(() => {
    if (phase !== 'loading' && phase !== 'scene') return;
    const root = rootRef.current;
    if (!root) return;

    const trapTargets = (): HTMLElement[] => {
      const targets: HTMLElement[] = [root];
      const skip = skipRef.current;
      if (skip && root.contains(skip)) targets.push(skip);
      return targets;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const targets = trapTargets();
      if (targets.length === 0) return;
      e.preventDefault();
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? targets.indexOf(active) : -1;
      if (e.shiftKey) {
        const next = idx <= 0 ? targets[targets.length - 1]! : targets[idx - 1]!;
        next.focus({ preventScroll: true });
      } else {
        const next = idx >= targets.length - 1 || idx < 0 ? targets[0]! : targets[idx + 1]!;
        next.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [phase]);

  // Transition into the site: avatar travels into its slot while the overlay fades.
  const exiting = useRef(false);
  const exit = useCallback(() => {
    if (exiting.current || phase === 'exiting' || phase === 'done') return;
    exiting.current = true;

    const avatar = avatarRef.current;
    const target = landingTarget();
    const from = avatar?.getBoundingClientRect();
    const to = target?.getBoundingClientRect();

    beginExit();

    const bg = bgRef.current;
    const screen = rootRef.current?.querySelector<HTMLElement>('.intro-screen');
    if (screen) screen.classList.add('is-exiting');

    // Belt and braces: the site is usable no matter what the animation does.
    const backup = window.setTimeout(finish, TRAVEL_S * 1000 + 400);
    const done = () => {
      window.clearTimeout(backup);
      finish();
    };

    loadAnimate().then(
      (animate) => {
        if (bg) animate(bg, { opacity: [1, 0] }, { duration: BG_FADE_S, ease: EASE });
        if (avatar && from && to && from.width > 0 && to.width > 0) {
          avatar.style.transformOrigin = '0 0';
          avatar.style.willChange = 'transform';
          animate(
            avatar,
            {
              x: [0, to.left - from.left],
              y: [0, to.top - from.top],
              scale: [1, to.width / from.width],
            },
            { duration: TRAVEL_S, ease: EASE },
          ).then(done, done);
        } else {
          window.setTimeout(done, BG_FADE_S * 1000);
        }
      },
      () => done(),
    );
  }, [phase, beginExit, finish]);

  // Escape leaves immediately from any screen, including the loading one.
  useEffect(() => {
    if (phase === 'done') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        exit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, exit]);

  if (phase === 'done') return null;

  return (
    <div
      ref={rootRef}
      className={`intro intro-phase-${phase}${live ? ' intro-live' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={chrome.ui.intro.dialogLabel}
      tabIndex={-1}
    >
      <div ref={bgRef} className="intro-bg halftone" aria-hidden="true" />
      {phase === 'loading' ? <IntroLoading barRef={barRef} labelRef={labelRef} /> : null}
      {phase === 'scene' || phase === 'exiting' ? (
        <IntroScene
          lines={chrome.introLines}
          avatarRef={avatarRef}
          skipRef={skipRef}
          onEnter={exit}
          onSkip={exit}
          exiting={phase === 'exiting'}
        />
      ) : null}
    </div>
  );
}
