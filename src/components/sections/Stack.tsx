import type { CSSProperties } from 'react';

import { RevealLines } from '@/components/ui/Reveal';
import { Sparkle } from '@/components/ui/Sparkle';
import { content, type StackIconKey, type StackItem } from '@/content/content';
import extraStackIcons from '@/content/stack-icons.extra.json';
import { stackIcons } from '@/content/stack-icons.generated';

type StackIcon = { hex: string; hexOnDark: string; path: string; viewBox?: string };

/**
 * Logos are Simple Icons (https://simpleicons.org) plus hand-supplied marks in
 * stack-icons.extra.json: official brand-kit files for OpenAI and xAI, and a generic glyph for
 * FAISS (not a brand mark). One-color marks: ink on light, cream on dark. Trademarks belong to
 * their owners. Paths are inlined so hover color works (external <use href="/sprite.svg#…">
 * often ignores CSS currentColor).
 */
const icons: Record<StackIconKey, StackIcon> = { ...stackIcons, ...extraStackIcons };

function iconFor(item: StackItem) {
  return item.icon ? icons[item.icon] : undefined;
}

/** One slab of tools. Groups with no items are omitted; an empty slab is not rendered. */
export function Stack() {
  const groups = content.stack.filter((group) => group.items.length > 0);
  if (groups.length === 0) return null;

  return (
    <section id="stack" className="stack" aria-labelledby="stack-title">
      <span id="inventory" className="stack-alias" />
      <div className="section-title">
        <h2 id="stack-title" tabIndex={-1}>
          <RevealLines>{content.ui.sections.stack}</RevealLines>
        </h2>
        <Sparkle size={22} fill="sky" />
      </div>
      <ul className="stack-slab">
        {groups.map((group) => (
          <li key={group.group} className="stack-row">
            <span className="stack-label">{group.group}</span>
            <ul className="stack-tools">
              {group.items.map((item) => {
                const icon = iconFor(item);
                const style = {
                  '--stack-brand-light': icon ? `#${icon.hex}` : undefined,
                  '--stack-brand-dark': icon ? `#${icon.hexOnDark}` : undefined,
                } as CSSProperties;
                return (
                  <li key={item.name} className="stack-tool" style={style}>
                    {icon ? (
                      <svg
                        className="stack-logo"
                        viewBox={icon.viewBox ?? '0 0 24 24'}
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path fill="currentColor" d={icon.path} />
                      </svg>
                    ) : 'mono' in item ? (
                      <span className="stack-mono" aria-hidden="true">
                        {item.mono}
                      </span>
                    ) : null}
                    <span className="stack-name">{item.name}</span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
