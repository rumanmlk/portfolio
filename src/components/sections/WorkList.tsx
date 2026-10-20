import { ProjectCard } from '@/components/sections/ProjectCard';
import { Reveal } from '@/components/ui/Reveal';
import type { Project } from '@/content/content';

type Props = { projects: Project[] };

/** Project list in array order. EP. numbering follows the index. */
export function WorkList({ projects }: Props) {
  return (
    <ul className="work-list">
      {projects.map((project, index) => (
        <li key={project.id}>
          <Reveal>
            <ProjectCard project={project} index={index} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
