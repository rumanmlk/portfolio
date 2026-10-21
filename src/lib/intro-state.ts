/**
 * Shared "is the entry sequence still covering the page?" state.
 * Reveals, Lenis and the planet waits for `markIntroDone()`.
 */

const INTRO_FAILSAFE_MS = 6500;

let done = false;
let claimed = false;
let failsafe = 0;
const listeners = new Set<() => void>();

function attr(): string | null {
  if (typeof document === 'undefined') return null;
  return document.documentElement.getAttribute('data-intro');
}

/** True while the overlay is (or is about to be) shown and has not finished. */
export function introIsPending(): boolean {
  if (done) return false;
  return attr() === 'on';
}

export function introIsDone(): boolean {
  return done || attr() !== 'on';
}

/**
 * The intro component calls this once it is alive and driving the sequence.
 * From then on the sequence has its own timers; the JS failsafe (which mirrors
 * the pure-CSS one for the "script never ran" case) is cancelled.
 */
export function claimIntro(): void {
  claimed = true;
  window.clearTimeout(failsafe);
  failsafe = 0;
}

export function markIntroDone(): void {
  if (done) return;
  done = true;
  // "off" stays "off" when the sequence never ran; "on" becomes "done".
  if (typeof document !== 'undefined' && attr() === 'on') {
    document.documentElement.setAttribute('data-intro', 'done');
  }
  window.clearTimeout(failsafe);
  failsafe = 0;
  listeners.forEach((l) => l());
  listeners.clear();
}

/**
 * Runs `cb` once when the intro finishes (or immediately if it already has).
 */
export function onIntroDone(cb: () => void): () => void {
  if (!introIsPending()) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  if (!claimed && !failsafe) failsafe = window.setTimeout(markIntroDone, INTRO_FAILSAFE_MS);
  return () => {
    listeners.delete(cb);
  };
}
