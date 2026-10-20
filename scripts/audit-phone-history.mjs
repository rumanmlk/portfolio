/**
 * Report commits that still contain a Pakistan-style mobile number in tracked text.
 * Does not rewrite history. Usage: node scripts/audit-phone-history.mjs
 */
import { execSync } from 'node:child_process';

const PHONE = String.raw`\+92|03[0-9]{2}[- ]?[0-9]{7}`;
const commits = execSync(`git rev-list --all`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

const hits = [];
for (const sha of commits) {
  let out = '';
  try {
    out = execSync(`git grep -n -E "${PHONE}" ${sha} -- "*.ts" "*.tsx" "*.json" "*.mjs" "*.md"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    continue;
  }
  if (!out.trim()) continue;
  const subject = execSync(`git log -1 --format=%s ${sha}`, { encoding: 'utf8' }).trim();
  const files = [
    ...new Set(
      out
        .trim()
        .split('\n')
        .map((line) => line.split(':')[1])
        .filter(Boolean),
    ),
  ];
  hits.push({ sha: sha.slice(0, 7), subject, files, lines: out.trim().split('\n').length });
}

console.log(`Commits with phone-like numbers: ${hits.length}`);
for (const h of hits) {
  console.log(`- ${h.sha}  ${h.subject}`);
  console.log(`  files: ${h.files.join(', ')} (${h.lines} matching lines)`);
}
if (hits.length === 0) console.log('(none)');
console.log(
  '\nWorking tree is separate: run tests/resume-privacy.spec.ts and search src/ + public/resume.pdf.',
);
console.log('History is not rewritten by this script.');
