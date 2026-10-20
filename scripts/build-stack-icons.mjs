/**
 * Builds src/content/stack-icons.generated.ts and public/stack-sprite.svg
 * from the `icon` slugs in src/content/content.ts. simple-icons is a
 * devDependency and is never imported by the site.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentPath = path.join(root, 'src', 'content', 'content.ts');
const outPath = path.join(root, 'src', 'content', 'stack-icons.generated.ts');
const spritePath = path.join(root, 'public', 'stack-sprite.svg');
const iconsJsonPath = path.join(root, 'node_modules', 'simple-icons', 'data', 'simple-icons.json');
const iconsDir = path.join(root, 'node_modules', 'simple-icons', 'icons');

const CREAM = 'F2EDE0';
const INK = '14121F';
/**
 * Below this luminance a chromatic brand is hard to see on charcoal, so we
 * lift toward white (Python/TS/K8s stay above this and keep their exact hex).
 */
const DARK_LIFT_BELOW = 0.12;

/**
 * Official / brand-kit hex when Simple Icons disagrees (no #).
 * Applied as the light-theme hover color.
 */
const HEX_OVERRIDES = {
  // SI = CSS royalblue #4169E1; wiki base blue is #336791.
  postgresql: '336791',
  // SI = legacy leaf #47A248; LeafyGreen logo default is green-dark-2.
  mongodb: '00684A',
};

/**
 * Dark-theme hover when an official lighter brand stop exists.
 */
const HEX_ON_DARK_OVERRIDES = {
  // LeafyGreen green-base — current MongoDB brand green, readable on charcoal.
  mongodb: '00ED64',
};

function lin(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function rgb(hex) {
  const n = Number.parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]) {
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase();
}

function luminance(hex) {
  const [r, g, b] = rgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Pure/near-black with no useful hue (Rust, Next.js). */
function isNearBlack(hex) {
  const [r, g, b] = rgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max < 40 && max - min < 16;
}

/** Mix brand toward white, keeping hue (for dark-theme readability). */
function lighten(hex, amount) {
  const [r, g, b] = rgb(hex);
  return toHex([
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount),
  ]);
}

/**
 * Dark hover fill: override → cream for near-black → exact brand →
 * lightened brand only when the official hex is too dark on charcoal.
 */
function hexOnDark(slug, brand) {
  if (HEX_ON_DARK_OVERRIDES[slug]) return HEX_ON_DARK_OVERRIDES[slug];
  if (isNearBlack(brand)) return CREAM;
  if (luminance(brand) >= DARK_LIFT_BELOW) return brand;
  // Lift until just past the readability floor (Django, pandas, Optuna, …).
  for (let t = 0.15; t <= 0.7; t += 0.05) {
    const lifted = lighten(brand, t);
    if (luminance(lifted) >= DARK_LIFT_BELOW) return lifted;
  }
  return lighten(brand, 0.5);
}

function readStackItems(source) {
  const start = source.indexOf('stack: [');
  const end = source.indexOf('writing:', start);
  if (start < 0 || end < 0) {
    throw new Error('Could not find the stack array in src/content/content.ts');
  }
  const block = source.slice(start, end);
  const items = [];
  for (const match of block.matchAll(/\{([^{}]+)\}/g)) {
    const body = match[1];
    const name = body.match(/name:\s*'([^']+)'/)?.[1];
    if (!name) continue;
    items.push({
      name,
      icon: body.match(/icon:\s*'([^']+)'/)?.[1],
      mono: body.match(/mono:\s*'([^']+)'/)?.[1],
    });
  }
  return items;
}

const source = readFileSync(contentPath, 'utf8');
const items = readStackItems(source);
const catalog = JSON.parse(readFileSync(iconsJsonPath, 'utf8'));
const bySlug = new Map(catalog.map((icon) => [icon.slug, icon]));

const missing = [];
const seen = new Set();
const records = [];

for (const item of items) {
  if (!item.icon || seen.has(item.icon)) continue;
  seen.add(item.icon);
  const entry = bySlug.get(item.icon);
  if (!entry) {
    if (!item.mono) missing.push(`${item.icon} (${item.name})`);
    continue;
  }
  const svg = readFileSync(path.join(iconsDir, `${item.icon}.svg`), 'utf8');
  const pathData = svg.match(/<path d="([^"]+)"/)?.[1];
  if (!pathData) {
    missing.push(`${item.icon} (${item.name}, no path)`);
    continue;
  }
  const brand = (HEX_OVERRIDES[item.icon] ?? entry.hex).toUpperCase();
  const lum = luminance(brand);
  // Light: wash near-white → ink. Dark: override / brand / lifted hue / cream.
  records.push({
    slug: item.icon,
    path: pathData,
    hex: lum > 0.85 ? INK : brand,
    hexOnDark: hexOnDark(item.icon, brand),
  });
}

if (missing.length > 0) {
  console.error('These simple-icons slugs do not exist:');
  for (const slug of missing) console.error(`  - ${slug}`);
  console.error('Add a `mono` label for tools without an official logo, or fix the slug.');
  process.exit(1);
}

const body = records
  .map(
    (icon) =>
      `  ${icon.slug}: {\n` +
      `    hex: '${icon.hex}',\n` +
      `    hexOnDark: '${icon.hexOnDark}',\n` +
      `    path: '${icon.path}',\n` +
      `  },`,
  )
  .join('\n');

const file = `/**
 * Brand colors + SVG paths for the Stack slab.
 * Logos are Simple Icons (https://simpleicons.org). Trademarks belong to their owners.
 * Paths are inlined (not via external <use>) so CSS currentColor/hover works.
 * Also written to /stack-sprite.svg. Generated by \`pnpm stack:icons\`. Do not edit by hand.
 */
export const stackIcons = {
${body}
} as const;

export type StackIconSlug = keyof typeof stackIcons;
`;

writeFileSync(outPath, file);

const symbols = records
  .map(
    (icon) =>
      `  <symbol id="stack-icon-${icon.slug}" viewBox="0 0 24 24"><path fill="currentColor" d="${icon.path}"/></symbol>`,
  )
  .join('\n');
const sprite = `<!-- Logos are Simple Icons (https://simpleicons.org). Trademarks belong to their owners. Generated by pnpm stack:icons. -->
<svg xmlns="http://www.w3.org/2000/svg">
${symbols}
</svg>
`;
writeFileSync(spritePath, sprite);
console.log(
  `Wrote ${records.length} icons to src/content/stack-icons.generated.ts and public/stack-sprite.svg`,
);
