import type { ReactNode } from 'react';

const cycle = ['fill-sky', 'fill-yellow', 'fill-pink'] as const;

type TagListProps = { items: readonly string[]; label: string; className?: string };

/** Tech tags as stickers whose fills cycle sky, yellow, pink. */
export function TagList({ items, label, className = '' }: TagListProps) {
  if (items.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-x-2.5 gap-y-3 ${className}`.trim()} aria-label={label}>
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className={`sticker ${cycle[i % cycle.length]}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

type ChipProps = { children: ReactNode; className?: string };

/** A plain 2px-bordered chip (project kind, PRIVATE). */
export function Chip({ children, className = '' }: ChipProps) {
  return <span className={`chip ${className}`.trim()}>{children}</span>;
}
