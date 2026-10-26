import type { ReactNode } from 'react';

import { content } from '@/content/content';

/**
 * Project and role details. Closed in the HTML: the yellow bar toggles it (native <details>, no JS).
 * Above phone width the CSS shows the body and hides the bar.
 */
export function MobileDetails({ children }: { children: ReactNode }) {
  const { ui } = content;

  return (
    <details className="mobile-details">
      <summary className="mobile-toggle">
        <span className="toggle-open">{ui.showDetails}</span>
        <span className="toggle-close">{ui.hideDetails}</span>
      </summary>
      {children}
    </details>
  );
}
