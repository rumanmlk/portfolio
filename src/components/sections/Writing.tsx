import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { content } from '@/content/content';

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
}

/** Rendered only when there are posts; otherwise the section and nav item vanish. */
export function Writing() {
  const posts = content.writing;
  if (posts.length === 0) return null;

  return (
    <section id="writing" aria-labelledby="writing-title">
      <div className="section-title">
        <h2 id="writing-title" tabIndex={-1}>
          <RevealLines>{content.ui.sections.writing}</RevealLines>
        </h2>
      </div>
      <ul className="writing-list">
        {posts.map((post) => (
          <Reveal as="li" key={post.url} className="writing-row">
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="writing-title">
              {post.title}
            </a>
            <time dateTime={post.date} className="mono text-muted">
              {formatDate(post.date)}
            </time>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
