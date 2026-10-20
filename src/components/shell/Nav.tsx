'use client';

import { useEffect, useRef, type MouseEvent } from 'react';

import { chrome } from '@/content/chrome';
import type { NavItem } from '@/content/content';
import { scrollToSection } from '@/lib/scroll';
import { useActiveSection } from '@/lib/use-active-section';

type Props = {
  items: NavItem[];
  variant: 'sidebar' | 'strip';
};

/** Section nav. Active item follows scroll; clicks smooth-scroll and move focus. */
export function Nav({ items, variant }: Props) {
  const ids = items.map((i) => i.id);
  const active = useActiveSection(ids);
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the active chip visible inside the horizontal strip.
  useEffect(() => {
    if (variant !== 'strip' || !active || !listRef.current) return;
    const list = listRef.current;
    const el = list.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!el) return;
    const left = el.offsetLeft - 16;
    const right = el.offsetLeft + el.offsetWidth + 16;
    if (left < list.scrollLeft) list.scrollTo({ left, behavior: 'smooth' });
    else if (right > list.scrollLeft + list.clientWidth)
      list.scrollTo({ left: right - list.clientWidth, behavior: 'smooth' });
  }, [active, variant]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <nav
      className={variant === 'sidebar' ? 'site-nav' : 'nav-strip print-hidden'}
      aria-label={variant === 'sidebar' ? chrome.ui.nav.ariaLabel : chrome.ui.nav.mobileAriaLabel}
    >
      <ul
        ref={listRef}
        className={variant === 'sidebar' ? 'flex flex-col gap-1.5' : 'nav-strip-list'}
      >
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} data-id={item.id}>
              <a
                href={`#${item.id}`}
                className={`nav-link themed${isActive ? ' is-active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={(e) => onClick(e, item.id)}
              >
                <span className="nav-caret" aria-hidden="true">
                  ▸
                </span>
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
