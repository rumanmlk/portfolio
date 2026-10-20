import type { CSSProperties } from 'react';

import { RevealLines } from '@/components/ui/Reveal';
import { Sparkle } from '@/components/ui/Sparkle';
import { content, type StackItem } from '@/content/content';
import { stackIcons, type StackIconSlug } from '@/content/stack-icons.generated';

/**
 * Logos are Simple Icons (https://simpleicons.org).
 * Trademarks belong to their owners. Paths are inlined so hover color works
 * (external <use href="/sprite.svg#…"> often ignores CSS currentColor).
 */
function iconFor(item: StackItem) {
  if (!item.icon || !(item.icon in stackIcons)) return undefined;
  return stackIcons[item.icon as StackIconSlug];
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
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path fill="currentColor" d={icon.path} />
                      </svg>
                    ) : (
                      <span className="stack-mono" aria-hidden="true">
                        {item.mono}
                      </span>
                    )}
                    <span className="stack-name">{item.name}</span>
                    <span className="stack-tip" aria-hidden="true">
                      {item.name}
                    </span>
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
