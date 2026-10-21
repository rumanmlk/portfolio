// Shared by scripts/build-resume-preview.mjs and tests/resume-privacy.spec.ts so the
// "no phone number in the public resume" rule has a single definition.

export const PHONE_PATTERNS = [
  /\+?92[\s-]?3\d\d[\s-]?\d{7}/,
  /\b03\d\d[\s-]?\d{7}\b/,
  /\+?\d[\d\s().-]{8,}\d/,
];
