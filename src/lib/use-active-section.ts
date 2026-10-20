'use client';

import { useEffect, useSyncExternalStore } from 'react';

/**
 * One IntersectionObserver for the whole page (B10): rootMargin
 * `-40% 0px -55% 0px` leaves a thin band; the section crossing it is active.
 * A bottom-of-page check makes the last section active when it is too short
 * to reach the band. Both nav variants read from this store.
 */

let activeId = '';
let observedIds: string[] = [];
let observer: IntersectionObserver | null = null;
let refCount = 0;
const listeners = new Set<() => void>();
const intersecting = new Set<string>();
let scrollRaf = 0;

function emit(next: string) {
  if (next === activeId) return;
  activeId = next;
  listeners.forEach((l) => l());
}

function compute() {
  const doc = document.documentElement;
  const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
  if (atBottom && observedIds.length > 0) {
    emit(observedIds[observedIds.length - 1]);
    return;
  }
  let next = '';
  for (const id of observedIds) if (intersecting.has(id)) next = id;
  emit(next);
}

function onScroll() {
  if (scrollRaf) return;
  scrollRaf = window.requestAnimationFrame(() => {
    scrollRaf = 0;
    compute();
  });
}

function start(ids: string[]) {
  observedIds = ids;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).id;
        if (e.isIntersecting) intersecting.add(id);
        else intersecting.delete(id);
      }
      compute();
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
  );
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

function stop() {
  observer?.disconnect();
  observer = null;
  intersecting.clear();
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
  scrollRaf = 0;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useActiveSection(ids: readonly string[]): string {
  const key = ids.join('|');

  useEffect(() => {
    refCount += 1;
    if (refCount === 1) start(key.split('|').filter(Boolean));
    return () => {
      refCount -= 1;
      if (refCount === 0) stop();
    };
  }, [key]);

  return useSyncExternalStore(
    subscribe,
    () => activeId,
    () => '',
  );
}
