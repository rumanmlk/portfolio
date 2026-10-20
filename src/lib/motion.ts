import type { Transition, Variants } from 'motion/react';

/** B10. Calm easing for reveals, hovers, fades. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** B10. Springy moments only: hero lines, stickers, avatar, intro dialogue. */
export const SPRING: Transition = { type: 'spring', stiffness: 260, damping: 18 };

/** B9. Avatar reactions. */
export const AVATAR_SPRING = { stiffness: 220, damping: 24 } as const;

export const DURATION = {
  micro: 0.15,
  reveal: 0.65,
  fade: 0.2,
} as const;

export const STAGGER = 0.06;

export const calm = (duration = DURATION.reveal, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE,
});

/** Fade up 24px. Used for cards, rows and text blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

/** Line reveal: translateY 100% to 0 inside an overflow-hidden wrapper. */
export const lineUp: Variants = {
  hidden: { y: '100%' },
  show: { y: 0 },
};

/** Sticker pop: scale 0.85 to 1, settling into its tilt. */
export const stickerPop = (tilt = 0): Variants => ({
  hidden: { opacity: 0, scale: 0.85, rotate: tilt },
  show: { opacity: 1, scale: 1, rotate: tilt },
});

export const viewportOnce = { once: true, margin: '-10%' } as const;
