import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { TagList } from '@/components/ui/Tag';
import { content, type Role } from '@/content/content';

function dates(role: Role) {
  const end = role.end === 'Present' ? content.ui.present : role.end;
  return role.start === end ? role.start : `${role.start} - ${end}`;
}

/** Real jobs and internships only; up to 3 bullets each (B7). */
export function Experience() {
  const roles = content.experience;
  if (roles.length === 0) return null;

  return (
    <section id="experience" aria-labelledby="experience-title">
      <div className="section-title">
        <h2 id="experience-title" tabIndex={-1}>
          <RevealLines>{content.ui.sections.experience}</RevealLines>
        </h2>
      </div>
      <ol className="experience-list">
        {roles.map((role, i) => (
          <Reveal as="li" key={`${role.company}-${i}`} className="experience-row">
            <p className="experience-dates mono">
              <time>{dates(role)}</time>
            </p>
            <div className="experience-body">
              <h3 className="experience-role">{role.role}</h3>
              <p className="experience-company mono text-muted">{role.company}</p>
              {role.bullets.length > 0 ? (
                <ul className="experience-bullets">
                  {role.bullets.slice(0, 3).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              ) : null}
              <TagList items={role.stack} label={`Stack at ${role.company}`} className="mt-4" />
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
