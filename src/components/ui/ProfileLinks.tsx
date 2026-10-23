import { content } from '@/content/content';

/** GitHub and LinkedIn as <li> items, shared by every list that shows the profiles. */
export function ProfileLinks() {
  const { socials, ui } = content;

  return (
    <>
      <li>
        <a href={socials.github} target="_blank" rel="noopener noreferrer">
          {ui.github}
        </a>
      </li>
      <li>
        <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">
          {ui.linkedin}
        </a>
      </li>
    </>
  );
}
