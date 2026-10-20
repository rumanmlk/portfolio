'use client';

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import { AnimatedAvatar } from '@/components/avatar/Avatar';
import { chrome } from '@/content/chrome';
import { loadAnimate, type AnimationHandle } from '@/lib/animate';
import { SPRING } from '@/lib/motion';

const TYPE_MS = 50;
const TYPE_CHARS = 2;
const AUTO_CONTINUE_MS = 8000;

type Props = {
  lines: readonly string[];
  avatarRef: RefObject<HTMLDivElement | null>;
  skipRef: RefObject<HTMLButtonElement | null>;
  /** All lines done and the user (or the timer) asked to enter the site. */
  onEnter: () => void;
  onSkip: () => void;
  exiting: boolean;
};

type Typewriter = { line: number; shown: number; done: boolean };

/** Screen 2 (B11): visual-novel scene with a typed dialogue box. */
export function IntroScene({ lines, avatarRef, skipRef, onEnter, onSkip, exiting }: Props) {
  const { ui, siteName } = chrome;
  const [tw, setTw] = useState<Typewriter>({ line: 0, shown: 0, done: lines.length === 0 });
  const twRef = useRef(tw);
  useEffect(() => {
    twRef.current = tw;
  }, [tw]);
  const boxRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const [avatarSize, setAvatarSize] = useState(300);

  const current = lines[tw.line] ?? '';
  const lineComplete = tw.shown >= current.length;
  const isLast = tw.line >= lines.length - 1;

  // Avatar size: clamp(220px, 40vw, 400px); 220px under 768px. Also capped by
  // the viewport height so it never overlaps the dialogue box.
  useLayoutEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const byHeight = Math.max(180, h - 320);
      const base = w < 768 ? 220 : Math.min(400, Math.max(220, w * 0.4));
      setAvatarSize(Math.round(Math.min(base, byHeight)));
    };
    compute();
    window.addEventListener('resize', compute, { passive: true });
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Dialogue box and name tag enter with the spring (shown plainly if the engine is missing).
  useEffect(() => {
    const box = boxRef.current;
    const tag = tagRef.current;
    let anims: AnimationHandle[] = [];
    let cancelled = false;
    const showPlain = () => {
      if (box) box.style.opacity = '1';
      if (tag) tag.style.opacity = '1';
    };
    loadAnimate().then(
      (animate) => {
        if (cancelled) return;
        anims = [
          box ? animate(box, { opacity: [0, 1], y: [28, 0] }, { ...SPRING, delay: 0.05 }) : null,
          tag
            ? animate(tag, { opacity: [0, 1], scale: [0.85, 1] }, { ...SPRING, delay: 0.2 })
            : null,
        ].filter((a): a is AnimationHandle => a !== null);
      },
      () => {
        if (!cancelled) showPlain();
      },
    );
    return () => {
      cancelled = true;
      anims.forEach((a) => a.stop());
    };
  }, []);

  // Typewriter: a few chars per tick keeps dialogue readable with less main-thread churn.
  useEffect(() => {
    if (tw.done || lineComplete || exiting) return;
    const id = window.setTimeout(() => {
      setTw((s) => ({
        ...s,
        shown: Math.min(s.shown + TYPE_CHARS, (lines[s.line] ?? '').length),
      }));
    }, TYPE_MS);
    return () => window.clearTimeout(id);
  }, [tw, lineComplete, lines, exiting]);

  // Nobody gets stuck: 8s of inactivity after a completed line moves on
  // (the last line enters the site, as B11 requires).
  useEffect(() => {
    if (!lineComplete || exiting) return;
    const id = window.setTimeout(() => {
      if (isLast) onEnter();
      else setTw((s) => ({ line: Math.min(s.line + 1, lines.length - 1), shown: 0, done: false }));
    }, AUTO_CONTINUE_MS);
    return () => window.clearTimeout(id);
  }, [lineComplete, isLast, exiting, onEnter, lines.length, tw.line]);

  // Advance logic shared by click, keys and scroll attempts.
  const advance = () => {
    if (exiting) return;
    const s = twRef.current;
    const text = lines[s.line] ?? '';
    if (s.shown < text.length) {
      setTw({ ...s, shown: text.length });
      return;
    }
    if (s.line < lines.length - 1) {
      setTw({ line: s.line + 1, shown: 0, done: false });
      return;
    }
    onEnter();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
        return;
      }
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        advance();
      }
    };
    const onWheel = () => advance();
    const onTouchMove = () => advance();
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouchMove);
    };
    // advance reads the latest state through twRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exiting, onSkip, onEnter]);

  return (
    <div className="intro-screen intro-scene" onClick={advance}>
      <div className="intro-topbar">
        <span className="mono text-muted">{ui.intro.portfolio}</span>
        <button
          ref={skipRef}
          type="button"
          className="btn btn-surface btn-small intro-skip"
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
        >
          {ui.intro.skip}
        </button>
      </div>

      <div className="intro-stage">
        <div
          ref={avatarRef}
          className="intro-avatar"
          style={{ width: avatarSize, height: avatarSize }}
        >
          <AnimatedAvatar
            size={avatarSize}
            decorative
            options={{ track: true, scroll: false, blink: true, bob: true }}
          />
        </div>
      </div>

      <div className="intro-bottom">
        <div ref={boxRef} className="intro-dialogue" style={{ opacity: 0 }}>
          <span
            ref={tagRef}
            className="sticker fill-yellow intro-nametag"
            style={{ opacity: 0 }}
            aria-hidden="true"
          >
            {siteName.toUpperCase()}
          </span>
          <p className="intro-text" aria-hidden="true">
            {current.slice(0, tw.shown)}
            <span className="intro-caret" aria-hidden="true" />
          </p>
          <p className="sr-only">{lines.join(' ')}</p>
          <span className={`intro-advance${lineComplete ? ' is-ready' : ''}`} aria-hidden="true">
            ▼
          </span>
        </div>
        <div className="intro-footer mono text-muted">
          <span>{ui.intro.clickToContinue}</span>
          <span className="intro-key">
            {ui.intro.press} <kbd className="intro-keycap">{ui.intro.enter}</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
