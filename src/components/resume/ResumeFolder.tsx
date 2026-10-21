import { chrome } from '@/content/chrome';

type Props = { href: string };

/**
 * Folder tile with a paper sheet. Server markup and CSS only: the lift runs on
 * :hover / :focus-visible without JS. A plain click is upgraded to the preview
 * dialog by ResumeTriggers; every other click goes straight to the PDF.
 */
export function ResumeFolder({ href }: Props) {
  const { resumeFolder, resumeDialog } = chrome.ui;
  return (
    <a
      href={href}
      className="resume-folder"
      data-resume-trigger=""
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="rf-back" aria-hidden="true">
        <span className="rf-tab" />
      </span>
      <span className="rf-paper" aria-hidden="true">
        <span className="rf-name">{chrome.siteName}</span>
        <span className="rf-sticker">{resumeFolder.sticker}</span>
        <span className="rf-bars">
          <span />
          <span />
          <span />
          <span />
        </span>
      </span>
      <span className="rf-front">
        <span className="rf-label">{resumeFolder.label}</span>
        <span className="rf-meta">{resumeFolder.meta}</span>
      </span>
      <span className="sr-only"> ({resumeDialog.filename})</span>
    </a>
  );
}
