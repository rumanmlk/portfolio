import { ProjectCard } from '@/components/sections/ProjectCard';
import { Reveal } from '@/components/ui/Reveal';
import { content, type Project } from '@/content/content';

type Props = { projects: Project[] };

function Cards({ projects, start }: { projects: Project[]; start: number }) {
  return (
    <ul className="work-list">
      {projects.map((project, index) => (
        <li key={project.id}>
          <Reveal>
            <ProjectCard project={project} index={start + index} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/**
 * Featured projects first and always visible; the rest sit behind a native
 * <details> (no JS, content stays in the server HTML). Numbering follows array order.
 */
export function WorkList({ projects }: Props) {
  // Featured projects come first in content.ts (a test enforces it), so numbers are array indices.
  const firstRest = projects.findIndex((p) => !p.featured);
  const split = firstRest === -1 ? projects.length : firstRest;
  const featured = projects.slice(0, split);
  const rest = projects.slice(split);
  const { ui } = content;

  return (
    <>
      <Cards projects={featured} start={0} />
      {rest.length > 0 ? (
        <details className="work-more">
          <summary className="btn btn-surface work-more-summary">
            <span className="work-more-open">
              {ui.moreProjects} ({rest.length})
            </span>
            <span className="work-more-close">{ui.fewerProjects}</span>
          </summary>
          <Cards projects={rest} start={split} />
        </details>
      ) : null}
    </>
  );
}
