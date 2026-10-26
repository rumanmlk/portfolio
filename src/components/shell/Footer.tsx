import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { content } from '@/content/content';

export function Footer() {
  const year = process.env.NEXT_PUBLIC_BUILD_YEAR ?? '2026';
  return (
    <footer className="site-footer mono-sm text-muted">
      <p>
        &copy; {year} {content.site.name}. {content.ui.footer.rights}
      </p>
      {/* Below 1024px the header's toggle scrolls away with the name row, so offer it again here. */}
      <ThemeToggle size="small" className="footer-theme-toggle print-hidden" />
    </footer>
  );
}
