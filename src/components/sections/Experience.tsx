import { MobileDetails } from '@/components/sections/MobileDetails';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { content, type Role } from '@/content/content';

/** 'YYYY-MM' to 'Mar 2026'. */
function label(ym: string) {
  return new Date(`${ym}-01`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function Dates({ role }: { role: Role }) {
  return (
    <>
      <time dateTime={role.start}>{label(role.start)}</time> {content.ui.dateRangeSeparator}{' '}
      {role.end === 'Present' ? (
        content.ui.present
      ) : (
        <time dateTime={role.end}>{label(role.end)}</time>
      )}
    </>
  );
}

/** Real jobs and internships only; one short summary each, with the Work projects built there (B7). */
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
              <Dates role={role} />
            </p>
            <div className="experience-body">
              <h3 className="experience-role">{role.role}</h3>
              <p className="experience-company mono text-muted">{role.company}</p>
              <MobileDetails>
                <p className="experience-summary">{role.summary}</p>
                {role.projects?.length ? (
                  <p className="experience-projects mono-sm">
                    <span className="text-muted">{content.ui.projectsLabel}:</span>{' '}
                    {role.projects.join(' / ')}
                  </p>
                ) : null}
              </MobileDetails>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
