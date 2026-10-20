'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { features } from '@/content/features';
import { prefersReducedMotion, saveDataEnabled } from '@/lib/device';
import { INTRO_SEEN_KEY } from '@/lib/head-scripts';
import { claimIntro, markIntroDone, onIntroDone } from '@/lib/intro-state';
import { getLenis } from '@/lib/scroll';
import { readStorage, writeStorage } from '@/lib/storage';

declare global {
  interface Window {
    /** Set by the head script when Escape lands before React is listening. */
    __introEscape?: 1;
    /** Registered while the sequence is showing so that same head listener can finish it. */
    __skipIntro?: () => void;
  }
}

export type IntroPhase = 'loading' | 'scene' | 'exiting' | 'done';

const MIN_LOADING_MS = 900;
const MAX_LOADING_MS = 1800;
const CROSSFADE_MS = 200;

/** Same rules as the inline head script (B11), re-evaluated in JS. */
export function shouldShowIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (!features.intro) return false;
  try {
    if (window.location.hash && window.location.hash.length > 1) return false;
    if (prefersReducedMotion()) return false;
    if (saveDataEnabled()) return false;
    if (window.innerHeight < 500) return false;
    if (readStorage('session', INTRO_SEEN_KEY)) return false;
    // The head script may have decided "off" for a reason we cannot re-derive.
    if (document.documentElement.getAttribute('data-intro') === 'off') return false;
  } catch {
    return false;
  }
  return true;
}

/** Idempotent: safe to call again after React's dev-mode remount resets <html>. */
function lockScroll() {
  const root = document.documentElement;
  if (root.dataset.introScrollLock === undefined) {
    root.dataset.introScrollLock = root.style.overflow || '';
  }
  root.style.overflow = 'hidden';
  root.classList.add('intro-avatar-hidden');
  getLenis()?.stop();
  // Do not set `inert` on #site: it delays LCP for the already-painted hero
  // under the overlay. The intro dialog is aria-modal; CSS blocks pointer events.
}

function unlockScroll() {
  const root = document.documentElement;
  if (root.dataset.introScrollLock !== undefined) {
    root.style.overflow = root.dataset.introScrollLock;
    delete root.dataset.introScrollLock;
  }
  getLenis()?.start();
}

export function revealLandingAvatar() {
  document.documentElement.classList.remove('intro-avatar-hidden');
}

/** Focus goes back to the visible page heading when the overlay closes (B11). */
export function focusPageHeading() {
  const headings = Array.from(document.querySelectorAll<HTMLElement>('h1'));
  const visible = headings.find((h) => h.offsetParent !== null) ?? headings[0];
  if (!visible) return;
  if (!visible.hasAttribute('tabindex')) visible.setAttribute('tabindex', '-1');
  visible.focus({ preventScroll: true });
}

/** Emergency exit used by the error boundary and bfcache restores. */
export function abortIntro() {
  try {
    unlockScroll();
    revealLandingAvatar();
  } finally {
    markIntroDone();
  }
}

type Options = {
  /** Called with 0..1 as real loading progress advances. Must be referentially stable. */
  onProgress: (p: number) => void;
};

export function useIntroState({ onProgress }: Options) {
  const [phase, setPhase] = useState<IntroPhase>('loading');
  const phaseRef = useRef<IntroPhase>('loading');
  const decision = useRef<boolean | null>(null);
  /** True only when this session actually presented the overlay (not a skip). */
  const didPresent = useRef(false);

  const go = useCallback((next: IntroPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  // Decide before paint; lock the page if the sequence runs. The overlay is
  // already hidden by CSS when the head script said "off", so unmounting it
  // a tick later causes no flash. The decision is made once; the DOM side
  // effects are re-applied on every run because React's dev remount resets
  // <html> attributes and classes.
  useLayoutEffect(() => {
    const skipNow = () => {
      if (phaseRef.current === 'done') return;
      abortIntro();
      phaseRef.current = 'done';
      go('done');
    };

    // Escape can arrive while the server HTML is on screen, before this
    // component's key listener exists. The head script records that.
    if (decision.current === null) {
      decision.current = shouldShowIntro() && window.__introEscape !== 1;
    }
    if (!decision.current) {
      markIntroDone();
      phaseRef.current = 'done';
      queueMicrotask(() => go('done'));
      return;
    }
    if (phaseRef.current === 'done') return;

    didPresent.current = true;
    window.__skipIntro = skipNow;
    document.documentElement.setAttribute(
      'data-intro',
      phaseRef.current === 'exiting' ? 'done' : 'on',
    );
    writeStorage('session', INTRO_SEEN_KEY, '1');
    if (phaseRef.current !== 'exiting') {
      lockScroll();
      claimIntro();
    }
    return () => {
      if (window.__skipIntro === skipNow) window.__skipIntro = undefined;
    };
  }, [go]);

  // If anything else ends the intro (error boundary, failsafe), tear down cleanly.
  useEffect(() => {
    return onIntroDone(() => {
      if (phaseRef.current === 'loading' || phaseRef.current === 'scene') {
        abortIntro();
        go('done');
      }
    });
  }, [go]);

  // Real loading progress: fonts + document readiness, min 900ms, cap 1.8s.
  useEffect(() => {
    if (phase !== 'loading') return;
    if (phaseRef.current === 'done') return;

    const t0 = performance.now();
    let fonts = 0;
    let doc = document.readyState === 'loading' ? 0 : 1;
    let timer = 0;

    const fontsPromise =
      typeof document.fonts?.ready?.then === 'function' ? document.fonts.ready : Promise.resolve();
    fontsPromise.then(() => {
      fonts = 1;
    });
    const onReady = () => {
      doc = 1;
    };
    document.addEventListener('readystatechange', onReady);
    window.addEventListener('load', onReady);

    // 10 Hz is enough for the bar; rAF (~60 Hz) inflated Lighthouse TBT.
    const tick = () => {
      const elapsed = performance.now() - t0;
      const data = 0.15 + 0.5 * fonts + 0.35 * doc;
      const byTime = Math.min(1, elapsed / MIN_LOADING_MS);
      const forced = elapsed / MAX_LOADING_MS;
      const p = Math.min(1, Math.max(Math.min(byTime, data), forced));
      onProgress(p);
      if (p >= 1 && elapsed >= MIN_LOADING_MS) {
        window.clearInterval(timer);
        timer = 0;
        window.setTimeout(() => go('scene'), CROSSFADE_MS / 2);
      }
    };
    timer = window.setInterval(tick, 100);
    tick();

    return () => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener('readystatechange', onReady);
      window.removeEventListener('load', onReady);
    };
  }, [phase, go, onProgress]);

  // bfcache restore must never replay or leave the page locked.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && phaseRef.current !== 'done') {
        abortIntro();
        go('done');
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [go]);

  /** Begin the exit: page unlocks and reveals start while the avatar travels. */
  const beginExit = useCallback(() => {
    if (phaseRef.current === 'exiting' || phaseRef.current === 'done') return;
    go('exiting');
    unlockScroll();
    markIntroDone();
  }, [go]);

  /** Final step after the avatar has landed. Focus restore runs in IntroSequence after unmount. */
  const finish = useCallback(() => {
    if (phaseRef.current === 'done') return;
    revealLandingAvatar();
    go('done');
  }, [go]);

  return { phase, beginExit, finish, didPresent };
}
