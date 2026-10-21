/**
 * Capability checks. Every function is safe to call during SSR (returns the
 * conservative default) and never throws.
 */

type NetworkInformation = { saveData?: boolean };

type NavigatorExtras = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export function prefersReducedMotion(): boolean {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** Subscribe to live changes of prefers-reduced-motion. Returns an unsubscribe. */
export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return () => {};
  try {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => cb(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  } catch {
    return () => {};
  }
}

/** True for mouse/trackpad users; false on touch-only devices. */
export function hasFinePointer(): boolean {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  } catch {
    return false;
  }
}

export function saveDataEnabled(): boolean {
  if (!isBrowser()) return false;
  try {
    return Boolean((navigator as NavigatorExtras).connection?.saveData);
  } catch {
    return false;
  }
}

/** Conservative "low-end device" heuristic used to skip the 3D scene. */
export function isLowEndDevice(): boolean {
  if (!isBrowser()) return true;
  try {
    const nav = navigator as NavigatorExtras;
    const cores = nav.hardwareConcurrency ?? 8;
    const memory = nav.deviceMemory ?? 8;
    return cores <= 4 || memory <= 4;
  } catch {
    return true;
  }
}

let webglSupport: boolean | undefined;

/** Probed once: capability cannot change, and each probe creates a real context. */
export function hasWebGL(): boolean {
  if (!isBrowser()) return false;
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    webglSupport = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

export function viewportWidth(): number {
  return isBrowser() ? window.innerWidth : 1280;
}

export function viewportHeight(): number {
  return isBrowser() ? window.innerHeight : 800;
}

/** requestIdleCallback with a setTimeout fallback. Returns a cancel function. */
export function whenIdle(cb: () => void, timeout = 1500): () => void {
  if (!isBrowser()) return () => {};
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof w.requestIdleCallback === 'function') {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, Math.min(timeout, 400));
  return () => window.clearTimeout(id);
}
