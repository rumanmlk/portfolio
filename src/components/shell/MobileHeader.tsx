import { Avatar } from '@/components/avatar/Avatar';
import { Nav } from '@/components/shell/Nav';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { content, getSections } from '@/content/content';

/**
 * Under 1024px the sidebar becomes a 64px sticky header plus a sticky,
 * horizontally scrollable nav strip with 44px touch targets (B6).
 */
export function MobileHeader() {
  const sections = getSections();

  return (
    <header className="mobile-header-wrap" data-shell="mobile">
      <div className="mobile-header halftone-side themed">
        <Avatar placement="mobile" />
        <p className="mobile-name">{content.site.name}</p>
        <ThemeToggle size="small" />
      </div>
      <Nav items={sections} variant="strip" />
    </header>
  );
}
