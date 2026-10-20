/**
 * Storage access that never throws. Private mode, strict settings and
 * sandboxed iframes can block Web Storage; every read and write is guarded
 * and falls back to an in-memory map for the life of the page.
 */

const memory = new Map<string, string>();

type Kind = 'local' | 'session';

function area(kind: Kind): Storage | null {
  try {
    const s = kind === 'local' ? window.localStorage : window.sessionStorage;
    // Some browsers expose the object but throw on access.
    const probe = '__probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function readStorage(kind: Kind, key: string): string | null {
  if (typeof window === 'undefined') return null;
  const s = area(kind);
  if (s) {
    try {
      return s.getItem(key);
    } catch {
      /* fall through */
    }
  }
  return memory.get(`${kind}:${key}`) ?? null;
}

export function writeStorage(kind: Kind, key: string, value: string): void {
  if (typeof window === 'undefined') return;
  memory.set(`${kind}:${key}`, value);
  const s = area(kind);
  if (s) {
    try {
      s.setItem(key, value);
    } catch {
      /* in-memory fallback already written */
    }
  }
}

export function removeStorage(kind: Kind, key: string): void {
  if (typeof window === 'undefined') return;
  memory.delete(`${kind}:${key}`);
  const s = area(kind);
  if (s) {
    try {
      s.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
