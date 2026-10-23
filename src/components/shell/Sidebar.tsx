import { Avatar } from '@/components/avatar/Avatar';
import { Nav } from '@/components/shell/Nav';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { Reveal, RevealPop } from '@/components/ui/Reveal';
import { ProfileLinks } from '@/components/ui/ProfileLinks';
import { Sticker } from '@/components/ui/Sticker';
import { content, getSections } from '@/content/content';

/** Desktop sidebar (B6). Sticky, full height, sky background with halftone dots. */
export function Sidebar() {
  const sections = getSections();
  const { site, socials, ui } = content;

  return (
    <header className="sidebar halftone-side themed" data-shell="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-pin">
          <Avatar placement="sidebar" />

          <RevealPop display="block" delay={0.05}>
            <Sticker fill="pixel" tilt={-3}>
              {ui.player}
            </Sticker>
          </RevealPop>

          <Reveal delay={0.1}>
            <p className="sidebar-name">{site.name}</p>
            <p className="mono mt-3 text-[13px] font-medium">{ui.classLabel}</p>
          </Reveal>
        </div>

        <div className="sidebar-rest">
          <Reveal delay={0.2}>
            <Nav items={sections} variant="sidebar" />
          </Reveal>

          <Reveal className="sidebar-bottom" delay={0.25}>
            <ul className="sidebar-links" aria-label="Profiles and resume">
              <ProfileLinks />
              <li>
                <a
                  href={socials.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-resume-trigger=""
                >
                  {ui.resume}
                </a>
              </li>
            </ul>
            <ThemeToggle />
          </Reveal>
        </div>
      </div>
    </header>
  );
}
