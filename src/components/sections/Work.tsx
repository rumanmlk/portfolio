import { WorkList } from '@/components/sections/WorkList';
import { RevealLines } from '@/components/ui/Reveal';
import { Sparkle } from '@/components/ui/Sparkle';
import { content } from '@/content/content';

export function Work() {
  if (content.projects.length === 0) return null;
  return (
    <section id="work" aria-labelledby="work-title">
      <div className="section-title">
        <h2 id="work-title" tabIndex={-1}>
          <RevealLines>{content.ui.sections.work}</RevealLines>
        </h2>
        <Sparkle size={22} fill="sky" />
      </div>
      <WorkList projects={content.projects} />
    </section>
  );
}
