/**
 * Motion's `animate` loaded on demand so the animation engine never sits in
 * the initial bundle (B14). Preload starts after the intro finishes, or, when
 * the intro does not run, after window load and an idle callback.
 */

import { whenIdle } from '@/lib/device';
import { introIsPending, onIntroDone } from '@/lib/intro-state';

export type Animate = (typeof import('motion'))['animate'];
export type AnimationHandle = ReturnType<Animate>;

let pending: Promise<Animate> | null = null;

export function loadAnimate(): Promise<Animate> {
  if (!pending) {
    pending = import('motion').then((m) => m.animate);
    pending.catch(() => {
      pending = null;
    });
  }
  return pending;
}

/**
 * One preload per page. With an intro, it starts when the intro finishes.
 * Without one, it waits for the load event, then idle, giving up after 3s.
 */
export function schedulePreloadAnimate(): () => void {
  if (typeof window === 'undefined') return () => {};
  let cancel = () => {};
  let stopped = false;

  const load = () => {
    if (!stopped) void loadAnimate().catch(() => {});
  };

  if (introIsPending()) {
    cancel = onIntroDone(load);
    return () => {
      stopped = true;
      cancel();
    };
  }

  const start = () => {
    if (!stopped) cancel = whenIdle(load, 3000);
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });

  return () => {
    stopped = true;
    cancel();
    window.removeEventListener('load', start);
  };
}
