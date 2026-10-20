import { content } from '@/content/content';
import { SITE_URL } from '@/lib/env';

/** B16: Person schema. Rendered inline; `<` is escaped so the JSON cannot close the tag. */
export function JsonLd() {
  const { site, socials, stack } = content;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.title,
    description: site.description,
    url: SITE_URL,
    email: `mailto:${site.email}`,
    image: `${SITE_URL}/opengraph-image`,
    sameAs: [socials.github, socials.linkedin],
    worksFor: { '@type': 'Organization', name: site.employer.name, url: site.employer.url },
    address: { '@type': 'PostalAddress', addressLocality: 'Lahore', addressCountry: 'PK' },
    knowsAbout: stack.flatMap((group) => group.items.map((item) => item.name)),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
