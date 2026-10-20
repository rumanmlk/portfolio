import { Sticker } from '@/components/ui/Sticker';
import { Chip, TagList } from '@/components/ui/Tag';
import { content, type Project } from '@/content/content';

type Props = { project: Project; index: number };

const linkOrder = ['live', 'code', 'paper'] as const;

/** A work card: always straight, always the same red shadow (B7). */
export function ProjectCard({ project, index }: Props) {
  const { ui } = content;
  const number = String(index + 1).padStart(2, '0');
  const titleId = `project-${project.id}-title`;
  const links = project.confidential
    ? []
    : linkOrder
        .map((key) => ({ key, href: project.links?.[key] }))
        .filter((l): l is { key: (typeof linkOrder)[number]; href: string } => Boolean(l.href));

  return (
    <article className="card project-card themed" aria-labelledby={titleId}>
      <div className="project-num" aria-hidden="true">
        <span className="sticker sticker-pixel project-ep">{ui.episode}</span>
        <span className="display project-number">{number}</span>
      </div>

      <div className="project-body">
        <h3 id={titleId} className="project-title">
          <span className="sr-only">
            {ui.episode} {number}:{' '}
          </span>
          {project.title}
        </h3>

        <div className="project-meta">
          <Chip>{ui.kinds[project.kind]}</Chip>
          {project.confidential ? <Chip className="chip-private">{ui.private}</Chip> : null}
          <span className="mono-sm text-muted">{project.ownership}</span>
        </div>

        <dl className="project-rows">
          <div className="project-row">
            <dt>
              <Sticker fill="yellow">{ui.problem}</Sticker>
            </dt>
            <dd>{project.problem}</dd>
          </div>
          {project.result ? (
            <div className="project-row">
              <dt>
                <Sticker fill="yellow">{ui.result}</Sticker>
              </dt>
              <dd>{project.result}</dd>
            </div>
          ) : null}
        </dl>

        <TagList items={project.stack} label={`Stack for ${project.title}`} />

        {links.length > 0 ? (
          <ul className="project-links" aria-label={`Links for ${project.title}`}>
            {links.map((l) => (
              <li key={l.key}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {ui.links[l.key]}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
