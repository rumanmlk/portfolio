# Ruman Malik — portfolio

Single-page portfolio for an AI engineer. Pixel stickers, 3px ink borders, hard offset shadows, and halftone dots, with plain developer English, light theme by default, dark theme opt-in, an entry sequence, an illustrated avatar that reacts to the cursor and scroll, and a lazy halftone planet in the hero.

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript strict, Tailwind CSS 4, Motion, Lenis, React Three Fiber, Playwright. No UI kit, no CMS, no backend, no contact form (mailto only).

## Quick start

```bash
pnpm install          # pnpm 12 is pinned via "packageManager"; corepack or `npm i -g pnpm`
pnpm dev              # http://localhost:3000
pnpm check            # typecheck + lint + format check + production build
pnpm build && pnpm test:e2e   # required: Chromium desktop + mobile
```

Node 20.9+ is required. First Playwright run: `pnpm exec playwright install chromium` (add `firefox webkit` only if you use `test:e2e:all`).

## Scripts

| Script                | What it does                                                         |
| --------------------- | -------------------------------------------------------------------- |
| `pnpm dev`            | Dev server with Turbopack                                            |
| `pnpm build`          | Production build (fully static; fonts are downloaded at build time)  |
| `pnpm start -p 3100`  | Serve the production build                                           |
| `pnpm typecheck`      | `tsc --noEmit`                                                       |
| `pnpm lint`           | ESLint (Next core-web-vitals + TypeScript + React Compiler rules)    |
| `pnpm format`         | Prettier                                                             |
| `pnpm test:e2e`       | **Required.** Chromium desktop + mobile against the production build |
| `pnpm test:e2e:all`   | **Best-effort.** Also Firefox + WebKit, 1 worker, longer timeouts    |
| `pnpm test:e2e:fresh` | Build, then `pnpm test:e2e`                                          |
| `pnpm resume:pdf`     | Writes `public/resume-generated.pdf` from `resume.json`              |
| `pnpm stack:icons`    | Rebuilds icon colors + `public/stack-sprite.svg` from Simple Icons   |
| `pnpm check`          | Everything CI would run, in order                                    |

`test:e2e` is the gate for local work and CI. `test:e2e:all` is optional: Playwright’s Firefox/WebKit builds can fail to launch or flake on some Windows machines even when Chromium is green. Reinstall with `pnpm exec playwright install firefox webkit --force` if those browsers crash before `newPage`.

## Editing content

Every word on the site lives in **`src/content/content.ts`** (projects, experience, stack, site metadata). Locked UI chrome and intro lines also live in **`src/content/chrome.ts`** (imported by `content.ts`); feature flags are in **`src/content/features.ts`**. Client components must import `chrome` / `features`, not `content.ts`. Components never contain copy.

- `site` — name, title, description (used for SEO), email, location, employer, keywords.
- `socials` — GitHub, LinkedIn and the resume path.
- `status` — `openToRoles` drives the red square next to OPEN TO ROLES.
- `hero.lines` — the headline. The **last word of the last line** becomes the red accent word with the yellow highlight.
- `hero.pitch` — the paragraph under the headline.
- `intro.lines` — the dialogue typed out in the entry sequence. Two or three short lines work best.
- `projects` — ordered list; numbering (`EP. 01`…) follows array order. Each project has `kind` (`company` | `university` | `personal`), `ownership`, `problem`, optional `result`, `stack`, optional `links` (`live`, `code`, `paper`) and `confidential` (shows `PRIVATE` and hides links).
- `experience` — real jobs and internships only (university projects belong in `projects`). Up to three bullets are rendered per role. Use years for `start`/`end`; `end: 'Present'` renders as `PRESENT`.
- `stack` — groups of tools. Each item has a `name`, an optional simple-icons `icon` slug, and an optional `mono` label when the tool has no official logo. A group with no items is not rendered. After changing slugs, run `pnpm stack:icons` (writes colors plus the cached `/stack-sprite.svg`). Logos are Simple Icons; trademarks belong to their owners.
- `writing` — leave empty and the Writing section and its nav item are omitted.
- `features` — `intro`, `planet`, `smoothScroll` switches.
- `ui` — the locked UI wording (`PLAYER 01`, `> PRESS START`, section titles…). Change with care.

Long values, empty arrays and missing optional fields are all handled; the layout never breaks.

### Resume

`public/resume.pdf` is the resume visitors download. Replace that file when the resume changes. `pnpm resume:pdf` rebuilds a preview at `public/resume-generated.pdf` from `src/content/resume.json` and does not touch the file visitors download.

## Replacing the avatar

The avatar is an inline SVG in `src/components/avatar/AvatarSvg.tsx` (viewBox `0 0 120 120`). Keep the element structure (the head `<g>`, the two eye `<ellipse>`s and the two pupil `<circle>`s receive refs) so the motion hook in `useAvatarMotion.ts` can keep driving pupils, head tilt and blinks. The favicon (`src/app/icon.svg`), the Apple icon (`src/app/apple-icon.tsx`) and the 404 page reuse the same geometry; update them too if you change the drawing. Colors use the tokens: hair `--accent`, outlines `--ink`.

## Environment

| Variable               | Purpose                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Public origin without a trailing slash. Drives canonical URLs, Open Graph, sitemap, robots and JSON-LD. |

Resolved in `src/lib/site-url.ts` (the only place that reads this variable):

- **Production** (`VERCEL_ENV=production`): required. Must be `https://…` with no trailing slash, no path and no `localhost`, or the build throws.
- **Preview**: if unset, falls back to `https://${VERCEL_URL}`.
- **Local**: defaults to `http://localhost:3000`.

Copy `.env.example` to `.env.local` for local work. Validator coverage lives in `tests/site-url.spec.ts` (runs with `pnpm test:e2e`).

## Deploying on Vercel

1. Push the repository to GitHub/GitLab/Bitbucket and import it in Vercel. Next.js is detected automatically.
2. Add `NEXT_PUBLIC_SITE_URL=https://your-domain.com` to Production (and Preview if you want a fixed preview origin).
3. Deploy. The whole site is prerendered at build time, including the Open Graph image, the sitemap and robots.txt. No database or server is involved.

Web Analytics is wired via `@vercel/analytics` in the root layout. Enable it in the Vercel project (Analytics → Enable); nothing else third-party is loaded.

## Design and behaviour notes

- **Tokens.** All colors, spacing and fonts come from the CSS variables in `src/app/globals.css`. Radius is 0 everywhere; Tailwind's radius utilities are disabled.
- **Theme.** An inline script in `<head>` sets `data-theme` before first paint from `localStorage`; with nothing stored (or storage blocked) the site is light. The OS preference is never consulted.
- **Entry sequence.** Shown once per session (`sessionStorage`), skipped for deep links, reduced motion, data saver, landscape phones and bfcache restores. A pure-CSS failsafe hides it after 6 s if JavaScript never runs; while JavaScript is running every line auto-advances after 8 s so nobody can get stuck. The avatar hand-off into the sidebar is a measured, transform-only `animate()` from Motion: the sidebar avatar is always in the server HTML, so a shared `layoutId` would make the scene avatar fly in from the sidebar on mount.
- **Performance budget.** Modern browsers load about 148 KB of gzipped JavaScript for the first view (legacy `nomodule` polyfills are listed in HTML but not executed). Three.js, Lenis, the avatar springs, the intro scene and Motion's animation engine are all separate chunks loaded after hydration or on idle. Client UI chrome lives in `src/content/chrome.ts` / `features.ts` so projects and stack data stay out of the first-load bundle. The pixel font (DotGothic16, a CJK family) is self-hosted as a latin-only slice to keep the CSS small.
- **Reveals.** Nothing is hidden in the server HTML, so the page is complete without JavaScript. Elements are hidden only on the client before the first post-hydration paint, never when they are already in view without the intro, and always shown instantly under `prefers-reduced-motion`.
- **Accessibility.** Landmarks, one visible `h1`, skip link, visible focus rings, 44 px targets, `aria-live` for copy-to-clipboard, a modal dialog for the intro with focus restore. The axe-core audit in `tests/a11y.spec.ts` runs with WCAG 2.2 AA and best-practice rules.

## Project structure

```text
src/
  app/            layout, page, not-found, globals.css, metadata routes (OG image, icons, sitemap, robots, manifest)
  content/        content.ts (all copy), stack-icons.generated.ts, resume.json
  components/
    shell/        Sidebar, MobileHeader, Nav, ThemeToggle, StatusPanel, Footer, Boot, SmoothScroll, JsonLd
    sections/     Hero, Work, ProjectCard, WorkList, Experience, Stack, StackTips, Writing, Contact, CopyEmail
    avatar/       AvatarSvg, AvatarTile, Avatar, AvatarMotion, useAvatarMotion
    intro/        Intro, IntroSequence, IntroLoading, IntroScene, useIntroState
    three/        Planet, PlanetLoader, StaticPlanet
    ui/           Button, Tag, Sticker, Sparkle, Reveal, ErrorBoundary
  lib/            motion, device, storage, theme, scroll, intro-state, animate, reveal, env, head-scripts
  assets/fonts/   Anton + JetBrains Mono for the OG image, DotGothic16 latin slice (all OFL)
scripts/          build-resume.mjs, build-stack-icons.mjs
tests/            smoke.spec.ts, a11y.spec.ts
```
