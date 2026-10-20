'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

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

/** Three.js lives in its own chunk; nothing of it is in the initial bundle (B12). */
const PointCloud = dynamic(() => import('@/components/three/PointCloud'), { ssr: false });

function eligible(): boolean {
  if (!features.pointCloud) return false;
  if (prefersReducedMotion()) return false;
  if (window.innerWidth < 1024) return false;
  if (saveDataEnabled()) return false;
  if (isLowEndDevice()) return false;
  if (!hasWebGL()) return false;
  return true;
}

function StaticPattern() {
  return <div className="hero-cloud-static" aria-hidden="true" />;
}

/**
 * Mounts the 3D scene only after the intro finished and the browser is idle,
 * and only on capable desktop devices. Everything else gets the static dots.
 */
export function PointCloudLoader() {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  const [lost, setLost] = useState(false);
  const [running, setRunning] = useState(true);
  const host = useRef<HTMLDivElement>(null);

  // Wait for the intro, then for idle time, then evaluate eligibility.
  useEffect(() => {
    let cancelIdle: (() => void) | null = null;
    const offIntro = onIntroDone(() => {
      cancelIdle = whenIdle(() => {
        setOk(eligible());
        setReady(true);
      }, 2000);
    });
    return () => {
      offIntro();
      cancelIdle?.();
    };
  }, []);

  // Re-evaluate on resize (crossing 1024px) and live reduced-motion changes.
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const onResize = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setOk(eligible());
      });
    };
    window.addEventListener('resize', onResize, { passive: true });
    const offReduced = onReducedMotionChange(() => setOk(eligible()));
    return () => {
      window.removeEventListener('resize', onResize);
      offReduced();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [ready]);

  // Pause when the hero is off screen or the tab is hidden.
  useEffect(() => {
    if (!ready || !ok) return;
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
  }, [ready, ok]);

  const show3d = ready && ok && !lost;

  return (
    <div ref={host} className="point-cloud-host" style={{ position: 'absolute', inset: 0 }}>
      {show3d ? (
        <ErrorBoundary fallback={<StaticPattern />}>
          <PointCloud running={running} onContextLost={() => setLost(true)} />
        </ErrorBoundary>
      ) : (
        <StaticPattern />
      )}
    </div>
  );
}
