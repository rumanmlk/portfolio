'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { StaticPlanet } from '@/components/three/StaticPlanet';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { features } from '@/content/features';
import {
  hasWebGL,
  isLowEndDevice,
  onReducedMotionChange,
  prefersReducedMotion,
  saveDataEnabled,
  whenIdle,
} from '@/lib/device';
import { onIntroDone } from '@/lib/intro-state';

/** Three.js lives in its own chunk; nothing of it is in the initial bundle. */
const Planet = dynamic(() => import('@/components/three/Planet'), { ssr: false });

/** The planet column is display:none on phones; no point running WebGL for a box that is not there. */
function eligible(host: HTMLElement | null): boolean {
  if (!features.planet) return false;
  if (!host || host.clientWidth === 0) return false;
  if (saveDataEnabled()) return false;
  if (isLowEndDevice()) return false;
  if (!hasWebGL()) return false;
  return true;
}

/**
 * Mounts the 3D scene only after the intro finished and the browser is idle,
 * and only on capable devices where the planet is visible. Everything else keeps the CSS planet.
 */
export function PlanetLoader() {
  // null until the intro is done and the browser is idle, then whether the 3D scene may run.
  const [ok, setOk] = useState<boolean | null>(null);
  const [lost, setLost] = useState(false);
  const [running, setRunning] = useState(true);
  const [reduced, setReduced] = useState(false);
  const ready = ok !== null;
  const host = useRef<HTMLDivElement>(null);

  // Wait for the intro, then for idle time, then evaluate eligibility.
  useEffect(() => {
    let cancelIdle: (() => void) | null = null;
    const offIntro = onIntroDone(() => {
      cancelIdle = whenIdle(() => {
        setOk(eligible(host.current));
        setReduced(prefersReducedMotion());
      }, 2000);
    });
    return () => {
      offIntro();
      cancelIdle?.();
    };
  }, []);

  // Re-evaluate on resize (the column appears and disappears across breakpoints) and live reduced-motion changes.
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const onResize = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setOk(eligible(host.current));
      });
    };
    window.addEventListener('resize', onResize, { passive: true });
    const offReduced = onReducedMotionChange(setReduced);
    return () => {
      window.removeEventListener('resize', onResize);
      offReduced();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [ready]);

  // Pause when the hero is off screen or the tab is hidden.
  useEffect(() => {
    if (!ok) return;
    const el = host.current;
    let visible = true;
    let tabVisible = !document.hidden;
    const apply = () => setRunning(visible && tabVisible);
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        apply();
      },
      { threshold: 0 },
    );
    if (el) io.observe(el);
    const onVis = () => {
      tabVisible = !document.hidden;
      apply();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [ok]);

  const show3d = ok === true && !lost;

  return (
    <div ref={host} className="planet-host">
      {show3d ? (
        <ErrorBoundary fallback={<StaticPlanet />}>
          <Planet running={running} reduced={reduced} onContextLost={() => setLost(true)} />
        </ErrorBoundary>
      ) : (
        <StaticPlanet />
      )}
    </div>
  );
}
