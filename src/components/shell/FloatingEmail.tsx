'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { chrome } from '@/content/chrome';
import { content } from '@/content/content';

/** Sections where the button would be redundant: the hero buttons, the Contact section, the footer. */
const HIDE_ON = ['#top', '#contact', '.site-footer'];

/**
 * Phone and tablet only (CSS hides it beside the desktop sidebar). A mailto shortcut that appears
 * once the hero is out of view and tucks away again while Contact or the footer is on screen.
 * Hidden state is `inert` (no focus, taps or a11y tree) so only opacity and transform animate.
 * Loaded after idle; fails in isolation.
 */
export default function FloatingEmail() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScreen = new Set<Element>();
    // Whatever sits behind the pinned nav strip does not count as on screen.
    const strip =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-strip-h')) || 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        }
        setVisible(onScreen.size === 0);
      },
      { rootMargin: `-${strip}px 0px 0px 0px` },
    );
    HIDE_ON.forEach((selector) => {
      const el = document.querySelector(selector);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      className="floating-email print-hidden"
      aria-label={chrome.ui.quickContact}
      data-visible={visible}
      inert={!visible}
    >
      <Button href={`mailto:${content.site.email}`} variant="accent">
        {chrome.ui.emailMe}
      </Button>
    </aside>
  );
}
