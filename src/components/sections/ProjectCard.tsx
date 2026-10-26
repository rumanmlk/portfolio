import { MobileDetails } from '@/components/sections/MobileDetails';
import { Sticker } from '@/components/ui/Sticker';
import { Chip, TagList } from '@/components/ui/Tag';
import { content, type Project } from '@/content/content';

type Props = { project: Project; index: number };

const linkOrder = ['live', 'code', 'paper'] as const;

/** A work card: always straight, always the same red shadow (B7). `index` only sets the number. */
export function ProjectCard({ project, index }: Props) {
  const { ui } = content;
  const number = String(index + 1).padStart(2, '0');
  const titleId = `project-${project.id}-title`;
  const links = linkOrder.flatMap((key) => {
    const href = project.links?.[key];
    return href ? [{ key, href }] : [];
  });

  return (
    <article className="card project-card themed" aria-labelledby={titleId}>
      <div className="project-num" aria-hidden="true">
        <span className="display project-number">{number}</span>
      </div>

      <div className="project-body">
        <h3 id={titleId} className="project-title">
          {project.title}
        </h3>

        <p className="project-headline">{project.headline}</p>

        <div className="project-meta">
          <Chip>{ui.kinds[project.kind]}</Chip>
          {project.confidential ? <Chip className="chip-private">{ui.private}</Chip> : null}
          <span className="mono-sm text-muted">{project.ownership}</span>
        </div>

        <MobileDetails>
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
            {project.validation ? (
              <div className="project-row">
                <dt>
                  <Sticker fill="yellow">{ui.validation}</Sticker>
                </dt>
                <dd>{project.validation}</dd>
              </div>
            ) : null}
          </dl>

          {project.flow && project.flow.length > 0 ? (
            <ol className="project-flow" role="list" aria-label={`${ui.flow}: ${project.title}`}>
              {project.flow.map((step, i) => (
                <li key={`${step}-${i}`} className="chip">
                  {step}
                </li>
              ))}
            </ol>
          ) : null}

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
        </MobileDetails>
      </div>
    </article>
  );
}
