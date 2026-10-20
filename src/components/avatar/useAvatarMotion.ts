'use client';

import { animate, useMotionValue, useSpring } from 'motion/react';
import { useEffect, type RefObject } from 'react';

import { hasFinePointer, onReducedMotionChange, prefersReducedMotion } from '@/lib/device';
import { AVATAR_SPRING } from '@/lib/motion';

export type AvatarPartRefs = {
  svg: RefObject<SVGSVGElement | null>;
  head: RefObject<SVGGElement | null>;
  eyeL: RefObject<SVGEllipseElement | null>;
  eyeR: RefObject<SVGEllipseElement | null>;
  pupilL: RefObject<SVGCircleElement | null>;
  pupilR: RefObject<SVGCircleElement | null>;
};

export type AvatarMotionOptions = {
  /** Pupils and head follow the pointer (fine pointers only). */
  track?: boolean;
  /** React to scroll direction. */
  scroll?: boolean;
  /** Random blink every 2.5 to 6 seconds. */
  blink?: boolean;
  /** 2px idle bob (CSS keyframes, transform only). */
  bob?: boolean;
};

const PUPIL_MAX = 3; // viewBox units
const HEAD_MAX_DEG = 3;
const SCROLL_IDLE_MS = 500;
const SCROLL_MIN_DELTA = 2;
const BLINK_MS = 0.12;

/**
 * B9 behaviors driven by Motion values and springs (stiffness 220, damping 24).
 * Values are written straight to the SVG parts; React never re-renders per frame.
 * Everything is disabled under prefers-reduced-motion and cleaned up on unmount.
 */
export function useAvatarMotion(parts: AvatarPartRefs, options: AvatarMotionOptions = {}) {
  const { track = true, scroll = true, blink = true, bob = true } = options;

  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);
  const headRot = useMotionValue(0);
  const headY = useMotionValue(0);
  const lid = useMotionValue(1);

  const sPupilX = useSpring(pupilX, AVATAR_SPRING);
  const sPupilY = useSpring(pupilY, AVATAR_SPRING);
  const sHeadRot = useSpring(headRot, AVATAR_SPRING);
  const sHeadY = useSpring(headY, AVATAR_SPRING);

  // Bind spring outputs to the DOM.
  useEffect(() => {
    const writePupils = () => {
      const t = `translate(${sPupilX.get().toFixed(2)}px, ${sPupilY.get().toFixed(2)}px)`;
      if (parts.pupilL.current) parts.pupilL.current.style.transform = t;
      if (parts.pupilR.current) parts.pupilR.current.style.transform = t;
    };
    const writeHead = () => {
      if (!parts.head.current) return;
      parts.head.current.style.transform = `translateY(${sHeadY.get().toFixed(2)}px) rotate(${sHeadRot
        .get()
        .toFixed(2)}deg)`;
    };
    const writeLid = () => {
      const t = `scaleY(${lid.get().toFixed(3)})`;
      if (parts.eyeL.current) parts.eyeL.current.style.transform = t;
      if (parts.eyeR.current) parts.eyeR.current.style.transform = t;
    };
    const offs = [
      sPupilX.on('change', writePupils),
      sPupilY.on('change', writePupils),
      sHeadRot.on('change', writeHead),
      sHeadY.on('change', writeHead),
      lid.on('change', writeLid),
    ];
    return () => offs.forEach((off) => off());
  }, [parts, sPupilX, sPupilY, sHeadRot, sHeadY, lid]);

  // Pointer tracking, scroll reaction, blink, bob.
  useEffect(() => {
    let reduced = prefersReducedMotion();
    const fine = hasFinePointer();
    const svg = parts.svg.current;
    if (!svg) return;

    const cleanups: Array<() => void> = [];

    /* ---------- idle bob (CSS keyframes) ---------- */
    const applyBob = () => {
      svg.classList.toggle('avatar-bob', bob && !reduced);
    };
    applyBob();
    cleanups.push(() => svg.classList.remove('avatar-bob'));

    /* ---------- cursor tracking ---------- */
    let rect: DOMRect | null = null;
    let pointerRaf = 0;
    let lastPointer: { x: number; y: number } | null = null;
    const refreshRect = () => {
      rect = svg.getBoundingClientRect();
    };
    const applyPointer = () => {
      pointerRaf = 0;
      if (!lastPointer || reduced) return;
      if (!rect) refreshRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = lastPointer.x - cx;
      const dy = lastPointer.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      // Full deflection once the pointer is ~240px away.
      const k = Math.min(1, dist / 240);
      pupilX.set((dx / dist) * PUPIL_MAX * k);
      pupilY.set((dy / dist) * PUPIL_MAX * k);
      headRot.set((dx / dist) * HEAD_MAX_DEG * k);
    };
    const onPointerMove = (e: PointerEvent) => {
      lastPointer = { x: e.clientX, y: e.clientY };
      if (!pointerRaf) pointerRaf = window.requestAnimationFrame(applyPointer);
    };
    const onPointerLeave = () => {
      lastPointer = null;
      pupilX.set(0);
      pupilY.set(0);
      headRot.set(0);
    };
    let rectRaf = 0;
    const invalidateRect = () => {
      if (rectRaf) return;
      rectRaf = window.requestAnimationFrame(() => {
        rectRaf = 0;
        rect = null;
      });
    };

    if (track && fine && !reduced) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onPointerLeave);
      window.addEventListener('resize', invalidateRect, { passive: true });
      window.addEventListener('scroll', invalidateRect, { passive: true });
      cleanups.push(() => {
        window.removeEventListener('pointermove', onPointerMove);
        document.documentElement.removeEventListener('pointerleave', onPointerLeave);
        window.removeEventListener('resize', invalidateRect);
        window.removeEventListener('scroll', invalidateRect);
        if (pointerRaf) window.cancelAnimationFrame(pointerRaf);
        if (rectRaf) window.cancelAnimationFrame(rectRaf);
      });
    }

    /* ---------- scroll reaction ---------- */
    let lastY = window.scrollY;
    let scrollRaf = 0;
    let scrollTimer = 0;
    const settle = () => {
      pupilY.set(0);
      headY.set(0);
      headRot.set(0);
    };
    const applyScroll = () => {
      scrollRaf = 0;
      if (reduced) return;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (Math.abs(delta) < SCROLL_MIN_DELTA) return;
      const dir = Math.sign(delta);
      pupilY.set(3 * dir);
      headY.set(2 * dir);
      headRot.set(3 * dir);
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(settle, SCROLL_IDLE_MS);
    };
    const onScroll = () => {
      if (!scrollRaf) scrollRaf = window.requestAnimationFrame(applyScroll);
    };
    if (scroll && fine && !reduced) {
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll);
        window.clearTimeout(scrollTimer);
        if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      });
    }

    /* ---------- blink ---------- */
    let blinkTimer = 0;
    let blinkAnim: { stop: () => void } | null = null;
    const scheduleBlink = () => {
      window.clearTimeout(blinkTimer);
      if (!blink || reduced || document.hidden) return;
      const delay = 2500 + Math.random() * 3500;
      blinkTimer = window.setTimeout(() => {
        blinkAnim = animate(lid, [1, 0.04, 1], { duration: BLINK_MS, ease: 'easeInOut' });
        scheduleBlink();
      }, delay);
    };
    const onVisibility = () => {
      if (document.hidden) {
        window.clearTimeout(blinkTimer);
        blinkAnim?.stop();
        lid.set(1);
      } else {
        scheduleBlink();
      }
    };
    if (blink) {
      scheduleBlink();
      document.addEventListener('visibilitychange', onVisibility);
      cleanups.push(() => {
        window.clearTimeout(blinkTimer);
        blinkAnim?.stop();
        document.removeEventListener('visibilitychange', onVisibility);
      });
    }

    /* ---------- live reduced-motion changes ---------- */
    cleanups.push(
      onReducedMotionChange((next) => {
        reduced = next;
        applyBob();
        if (reduced) {
          window.clearTimeout(blinkTimer);
          blinkAnim?.stop();
          lid.set(1);
          pupilX.set(0);
          pupilY.set(0);
          headRot.set(0);
          headY.set(0);
        } else {
          scheduleBlink();
        }
      }),
    );

    return () => cleanups.forEach((fn) => fn());
  }, [parts, track, scroll, blink, bob, pupilX, pupilY, headRot, headY, lid]);
}
