import { ResumeFolder } from '@/components/resume/ResumeFolder';
import { CopyEmail } from '@/components/sections/CopyEmail';
import { Reveal, RevealPop } from '@/components/ui/Reveal';
import { Sticker } from '@/components/ui/Sticker';
import { content } from '@/content/content';

export function Contact() {
  const { site, socials, ui } = content;

  return (
    <section id="contact" aria-labelledby="contact-title" className="contact">
      <RevealPop display="block" className="contact-tag">
        <Sticker fill="yellow" tilt={-2} className="pixel" as="div">
          {ui.continueTag}
        </Sticker>
      </RevealPop>

      <h2 id="contact-title" className="sr-only" tabIndex={-1}>
        {ui.sections.contact}
      </h2>

      <div className="contact-grid">
        <div className="contact-main">
          <Reveal delay={0.05}>
            <a href={`mailto:${site.email}`} className="contact-link display themed">
              {ui.letsTalk}
            </a>
          </Reveal>

          <Reveal className="contact-row" delay={0.1}>
            <CopyEmail email={site.email} />
            <ul className="contact-links" aria-label="Profiles">
              <li>
                <a href={socials.github} target="_blank" rel="noopener noreferrer">
                  {ui.github}
                </a>
              </li>
              <li>
                <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">
                  {ui.linkedin}
                </a>
              </li>
            </ul>
          </Reveal>
        </div>

        <Reveal className="contact-folder" delay={0.15}>
          <ResumeFolder href={socials.resume} />
        </Reveal>
      </div>
    </section>
  );
}
