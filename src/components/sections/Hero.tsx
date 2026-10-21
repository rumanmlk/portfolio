import { PlanetLoader } from '@/components/three/PlanetLoader';
import { Button } from '@/components/ui/Button';
import { Sparkle } from '@/components/ui/Sparkle';
import { Sticker } from '@/components/ui/Sticker';
import { content } from '@/content/content';

/** Splits the headline so the final word can carry the accent + highlight. */
export function splitHeadline(lines: readonly string[]) {
  const safe = lines.map((l) => l.trim()).filter(Boolean);
  if (safe.length === 0) return { lines: [] as string[], lastLead: '', lastWord: '' };
  const last = safe[safe.length - 1];
  const words = last.split(/\s+/);
  const lastWord = words.pop() ?? '';
  return { lines: safe.slice(0, -1), lastLead: words.join(' '), lastWord };
}

/**
 * Hero copy stays in the server HTML with no client reveal wrapper so it can
 * be the LCP element from first paint (never waits for hydration or Motion).
 */
export function Hero() {
  const { hero, socials, ui } = content;
  const { lines, lastLead, lastWord } = splitHeadline(hero.lines);

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-sparkles" aria-hidden="true">
        <Sparkle size={30} fill="yellow" className="hero-sparkle-a" />
        <Sparkle size={20} fill="sky" className="hero-sparkle-b" />
      </div>

      <div className="hero-content">
        <div className="hero-tag">
          <Sticker fill="yellow" tilt={-2} className="pixel" as="div">
            {ui.pressStart}
          </Sticker>
        </div>

        <h2 id="hero-title" className="hero-title">
          {lines.map((line, i) => (
            <span key={i} className="line-clip">
              <span className="reveal-line hero-line" style={{ display: 'block' }}>
                {line}
              </span>
            </span>
          ))}
          <span className="line-clip">
            <span className="reveal-line hero-line" style={{ display: 'block' }}>
              {lastLead ? <>{lastLead} </> : null}
              <span className="hero-accent">
                <span className="highlight">{lastWord}</span>
              </span>
            </span>
          </span>
        </h2>

        <p className="hero-pitch">{hero.pitch}</p>

        <div className="hero-actions">
          <Button href="#work" variant="accent">
            {ui.seeMyWork}
          </Button>
          <Button href={socials.resume} variant="surface" external data-resume-trigger="">
            {ui.resume}
          </Button>
        </div>
      </div>

      <div className="hero-planet" aria-hidden="true">
        <PlanetLoader />
      </div>
    </section>
  );
}
