'use client';

import {
  Children,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

import { loadAnimate, type AnimationHandle } from '@/lib/animate';
import { prefersReducedMotion } from '@/lib/device';
import { introIsPending, onIntroDone } from '@/lib/intro-state';
import { DURATION, EASE, SPRING } from '@/lib/motion';
import { isInView, nextStagger } from '@/lib/reveal';

/** Cubic-bezier matching `--ease` / Motion EASE, for element.animate(). */
const EASE_CSS = `cubic-bezier(${EASE.join(', ')})`;

type Restore = (el: HTMLElement) => void;

/**
 * Calm reveals use the Web Animations API (no Motion). First-viewport content
 * stays visible in the server HTML and is never hidden while waiting for JS.
 * Below-fold nodes hide only until they enter the viewport, then animate.
 */
function useCalmReveal(
  ref: React.RefObject<HTMLElement | null>,
  hide: (el: HTMLElement) => void,
  restore: Restore,
  play: (el: HTMLElement, delay: number) => Animation | Animation[],
  delay: number,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let io: IntersectionObserver | null = null;
    let offIntro: (() => void) | null = null;
    let running: Animation[] = [];
    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      const d = delay + nextStagger();
      const result = play(el, d);
      running = Array.isArray(result) ? result : [result];
    };

    const waitForView = () => {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            io = null;
            start();
          }
        },
        { rootMargin: '-10% 0px -10% 0px', threshold: 0 },
      );
      io.observe(el);
    };

    // Intro covers an already-painted page: never hide above-fold content.
    if (introIsPending()) {
      offIntro = onIntroDone(() => {
        /* stay visible; entrance skipped so LCP is not delayed */
      });
    } else if (!isInView(el)) {
      hide(el);
      waitForView();
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      offIntro?.();
      running.forEach((a) => a.cancel());
      restore(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Springy reveals may use Motion after the intro or idle. Content that is
 * already in view (including under the intro overlay) is never hidden; if
 * Motion is late we fall back to a calm WAAPI pop or leave it as painted.
 */
function useSpringReveal(
  ref: React.RefObject<HTMLElement | null>,
  hide: (el: HTMLElement) => void,
  restore: Restore,
  playMotion: (el: HTMLElement, delay: number) => Promise<AnimationHandle | AnimationHandle[]>,
  playFallback: (el: HTMLElement, delay: number) => void,
  delay: number,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let io: IntersectionObserver | null = null;
    let offIntro: (() => void) | null = null;
    let running: AnimationHandle[] = [];
    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      const d = delay + nextStagger();
      playMotion(el, d).then(
        (result) => {
          if (cancelled) {
            restore(el);
            return;
          }
          running = Array.isArray(result) ? result : [result];
        },
        () => {
          if (!cancelled) playFallback(el, d);
        },
      );
    };

    const waitForView = () => {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            io = null;
            start();
          }
        },
        { rootMargin: '-10% 0px -10% 0px', threshold: 0 },
      );
      io.observe(el);
    };

    if (introIsPending()) {
      // Keep first paint visible under the overlay; skip the entrance after.
      offIntro = onIntroDone(() => {
        /* already painted */
      });
    } else if (!isInView(el)) {
      hide(el);
      waitForView();
    }
    // In-view with no intro: leave the server HTML as painted (no hide, no wait).

    return () => {
      cancelled = true;
      io?.disconnect();
      offIntro?.();
      running.forEach((a) => a.stop());
      restore(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function settle(el: HTMLElement) {
  el.style.willChange = '';
}

function restoreBox(el: HTMLElement) {
  el.style.opacity = '';
  el.style.transform = '';
  el.style.willChange = '';
}

function waapiFadeUp(el: HTMLElement, delay: number, y: number) {
  el.style.willChange = 'transform, opacity';
  const anim = el.animate(
    [
      { opacity: 0, transform: `translateY(${y}px)` },
      { opacity: 1, transform: 'translateY(0px)' },
    ],
    {
      duration: DURATION.reveal * 1000,
      delay: delay * 1000,
      easing: EASE_CSS,
      fill: 'both',
    },
  );
  anim.finished.then(
    () => restoreBox(el),
    () => restoreBox(el),
  );
  return anim;
}

function waapiLineUp(line: HTMLElement, delay: number) {
  line.style.willChange = 'transform';
  const anim = line.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }], {
    duration: DURATION.reveal * 1000,
    delay: delay * 1000,
    easing: EASE_CSS,
    fill: 'both',
  });
  anim.finished.then(
    () => settle(line),
    () => settle(line),
  );
  return anim;
}

function waapiPop(el: HTMLElement, delay: number) {
  el.style.willChange = 'transform, opacity';
  const anim = el.animate(
    [
      { opacity: 0, transform: 'scale(0.85)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    {
      duration: 500,
      delay: delay * 1000,
      easing: EASE_CSS,
      fill: 'both',
    },
  );
  anim.finished.then(
    () => restoreBox(el),
    () => restoreBox(el),
  );
  return anim;
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Extra delay in seconds on top of the automatic stagger. */
  delay?: number;
  /** Fade-up distance in px. */
  y?: number;
  id?: string;
};

/** Calm fade-up (24px, 650ms) for cards, rows and text blocks. */
export function Reveal({
  children,
  as = 'div',
  className,
  style,
  delay = 0,
  y = 24,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useCalmReveal(
    ref,
    (el) => {
      el.style.opacity = '0';
      el.style.transform = `translateY(${y}px)`;
      el.style.willChange = 'transform, opacity';
    },
    restoreBox,
    (el, d) => waapiFadeUp(el, d, y),
    delay,
  );
  const Tag = as as 'div';
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className} style={style} id={id}>
      {children}
    </Tag>
  );
}

type LinesProps = {
  children: ReactNode;
  /** Springy (hero) or calm (section titles). */
  springy?: boolean;
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: 'span' | 'div';
};

function LinesShell({
  children,
  className,
  lineClassName,
  as,
  revealRef,
}: {
  children: ReactNode;
  className?: string;
  lineClassName: string;
  as: 'span' | 'div';
  revealRef: React.RefObject<HTMLElement | null>;
}) {
  const Wrapper = as;
  return (
    <Wrapper
      ref={revealRef as React.RefObject<HTMLDivElement & HTMLSpanElement>}
      className={className}
    >
      {Children.map(children, (child, i) => (
        <span key={i} className="line-clip">
          <span className={`reveal-line ${lineClassName}`.trim()} style={{ display: 'block' }}>
            {child}
          </span>
        </span>
      ))}
    </Wrapper>
  );
}

function CalmRevealLines({
  children,
  className,
  lineClassName = '',
  delay = 0,
  as = 'span',
}: Omit<LinesProps, 'springy'>) {
  const ref = useRef<HTMLElement>(null);
  const lines = () =>
    Array.from(
      ref.current?.querySelectorAll<HTMLElement>(':scope > .line-clip > .reveal-line') ?? [],
    );
  useCalmReveal(
    ref,
    () => {
      lines().forEach((line) => {
        line.style.transform = 'translateY(100%)';
        line.style.willChange = 'transform';
      });
    },
    () => lines().forEach(restoreBox),
    (_el, d) => lines().map((line, i) => waapiLineUp(line, d + i * 0.07)),
    delay,
  );
  return (
    <LinesShell revealRef={ref} className={className} lineClassName={lineClassName} as={as}>
      {children}
    </LinesShell>
  );
}

function SpringRevealLines({
  children,
  className,
  lineClassName = '',
  delay = 0,
  as = 'span',
}: Omit<LinesProps, 'springy'>) {
  const ref = useRef<HTMLElement>(null);
  const lines = () =>
    Array.from(
      ref.current?.querySelectorAll<HTMLElement>(':scope > .line-clip > .reveal-line') ?? [],
    );
  useSpringReveal(
    ref,
    () => {
      lines().forEach((line) => {
        line.style.transform = 'translateY(100%)';
        line.style.willChange = 'transform';
      });
    },
    () => lines().forEach(restoreBox),
    async (_el, d) => {
      const animate = await loadAnimate();
      return lines().map((line, i) =>
        animate(
          line,
          { y: ['100%', '0%'] },
          { ...SPRING, delay: d + i * 0.07, onComplete: () => settle(line) },
        ),
      );
    },
    (_el, d) => {
      lines().forEach((line, i) => waapiLineUp(line, d + i * 0.07));
    },
    delay,
  );
  return (
    <LinesShell revealRef={ref} className={className} lineClassName={lineClassName} as={as}>
      {children}
    </LinesShell>
  );
}

/** Line-by-line reveal: each child sits in an overflow-hidden wrapper and slides up. */
export function RevealLines({ springy = false, ...rest }: LinesProps) {
  return springy ? <SpringRevealLines {...rest} /> : <CalmRevealLines {...rest} />;
}

type PopProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** `block` keeps a block-level sticker on its own line. */
  display?: 'inline-block' | 'block';
};

/** Sticker pop: scale 0.85 to 1 with the spring, settling into the child's own tilt. */
export function RevealPop({ children, className, delay = 0, display = 'inline-block' }: PopProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useSpringReveal(
    ref,
    (el) => {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.85)';
      el.style.willChange = 'transform, opacity';
    },
    restoreBox,
    async (el, d) => {
      const animate = await loadAnimate();
      return animate(
        el,
        { opacity: [0, 1], scale: [0.85, 1] },
        { ...SPRING, delay: d, onComplete: () => settle(el) },
      );
    },
    (el, d) => {
      waapiPop(el, d);
    },
    delay,
  );
  return (
    <span
      ref={ref}
      className={`reveal-pop ${className ?? ''}`.trim()}
      style={{ display, width: display === 'block' ? 'fit-content' : undefined }}
    >
      {children}
    </span>
  );
}
