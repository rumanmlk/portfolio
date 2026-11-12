/**
 * Single source of truth for every word on the site.
 * Components never contain copy; they read from here.
 *
 * Editing guide: see README.md ("Editing content").
 */

import { chrome } from '@/content/chrome';
import { features } from '@/content/features';
import { SITE_URL } from '@/lib/site-url';

export type ProjectKind = 'company' | 'university' | 'personal';

export type Project = {
  id: string;
  title: string;
  kind: ProjectKind;
  /** What you personally owned, e.g. 'Built from scratch' | 'Contributed'. */
  ownership: string;
  /** One line. */
  problem: string;
  /** One line, with numbers when you have them. */
  result?: string;
  stack: string[];
  links?: { live?: string; code?: string; evaluation?: string; paper?: string };
  /** NDA work: shows a PRIVATE chip. Add `links` only with written approval from the owner. */
  confidential?: boolean;
  /** Shown in the first, always-visible group of Work. The rest sit behind "More projects". */
  featured?: boolean;
  /** One scannable line shown above the card body, e.g. '0.94 holdout accuracy'. */
  headline: string;
  /** 3 to 5 plain steps drawn as a flow diagram. Built from facts already in `result`. */
  flow?: string[];
  /** How the result was checked. Only state what is true and already public. */
  validation?: string;
};

export type Role = {
  company: string;
  role: string;
  /** 'YYYY-MM', matches the resume. */
  start: string;
  /** 'YYYY-MM' or 'Present'. */
  end: string | 'Present';
  /** One or two plain sentences. Details live in the project cards. */
  summary: string;
  /** Titles of Work projects built in this role (display only). */
  projects?: string[];
};

export type Education = {
  school: string;
  /** Short form shown in the page and JSON-LD. */
  shortName: string;
  degree: string;
  /** 'YYYY-MM', matches the resume. */
  start: string;
  end: string;
};

export type Post = { title: string; date: string; url: string };

export type NavItem = { id: SectionId; label: string };

export type SectionId = 'work' | 'experience' | 'stack' | 'writing' | 'contact';

/** Slugs from Simple Icons (generated) plus the hand-supplied marks in stack-icons.extra.json. */
export type StackIconKey =
  | import('@/content/stack-icons.generated').StackIconSlug
  | keyof typeof import('@/content/stack-icons.extra.json');

/** Every tool shows either a logo or a short mono label, never neither. */
export type StackItem = { name: string } & (
  { icon: StackIconKey; mono?: never } | { mono: string; icon?: never }
);

export type StackGroup = { group: string; items: StackItem[] };

export const content = {
  site: {
    name: chrome.siteName,
    shortName: chrome.shortName,
    title: 'Software Engineer',
    description:
      'Software engineer in Lahore shipping production ML forecasting at ExD and building evaluated LLM applications such as Lexio, a live cited-RAG app. Python and TypeScript backends, retrieval and LLM evaluation, full-stack delivery.',
    email: 'rumanmlk123@gmail.com',
    url: SITE_URL,
    location: 'Lahore, Pakistan',
    /** Shown in Contact. Add remote or relocation wording here only when it is true. */
    locationNote: 'Based in Lahore, Pakistan',
    /** Used in JSON-LD and the OG image. */
    employer: {
      name: 'Excellence Delivered (ExD)',
      url: 'https://www.linkedin.com/company/exdnow',
    },
    keywords: [
      'Ruman Malik',
      'AI engineer',
      'software engineer',
      'machine learning engineer',
      'full-stack developer',
      'Python',
      'TypeScript',
      'FastAPI',
      'React',
      'PostgreSQL',
      'LightGBM',
      'Docker',
      'LLM',
      'RAG',
      'pgvector',
      'Next.js',
      'Lahore',
      'Pakistan',
    ],
  },

  socials: {
    github: 'https://github.com/rumanmlk',
    linkedin: 'https://www.linkedin.com/in/ruman-malik',
    resume: '/resume.pdf?v=6',
  },

  hero: {
    lines: ['I build AI', 'that ships.'],
    pitch:
      'Software engineer at ExD. I ship production ML forecasting and build evaluated LLM applications like Lexio, a live cited-RAG app. Strong in Python and TypeScript backends, retrieval and LLM evaluation, and full-stack delivery.',
  },

  intro: {
    lines: chrome.introLines,
  },

  projects: [
    {
      id: 'lexio',
      title: 'Lexio: Cited Legal Q&A',
      kind: 'personal',
      ownership: 'Rebuilt from a university prototype',
      problem:
        'Answer questions about legal PDFs with the exact source page cited for every claim, and refuse when the evidence is weak.',
      result:
        'A deployed app that answers with Groq over Gemini embeddings. Fixing the keyword ranker lifted its MRR from 0.54 to 0.79 (first 73 questions), and LLM query rewriting raised follow-up retrieval from 7/11 to 11/11. Adds Google sign-in with per-user documents, direct-to-Blob uploads, rate limits and daily budget guards for free-tier quotas, prompt-injection fencing and Langfuse tracing (OpenTelemetry). EEA visitors fall back to keyword search to respect the Gemini terms. Sample documents need no sign-in.',
      stack: [
        'Next.js',
        'FastAPI',
        'PostgreSQL',
        'pgvector',
        'RAG',
        'Groq',
        'Gemini embeddings',
        'Vercel',
        'Neon',
        'Langfuse',
      ],
      headline: 'Cited source is on the gold page in 93% of answers (99/106)',
      featured: true,
      flow: [
        'Legal PDF',
        'Embed with Gemini',
        'Retrieve source pages',
        'Answer with Groq, citing the page',
        'Refuse when evidence is weak',
      ],
      validation:
        'Vector, keyword and hybrid (RRF) retrieval benchmarked on 106 gold-page questions with 95% confidence intervals; the eval harness caught a citation-parser bug that under-reported grounding, and a retrieval regression check runs weekly in GitHub Actions. Limits: the evaluation set is small and written by me, hybrid and vector-only retrieval are statistically tied, and there is no OCR for scanned PDFs.',
      links: {
        live: 'https://ask-lexio.vercel.app',
        code: 'https://github.com/rumanmlk/Lexio',
        evaluation: 'https://github.com/rumanmlk/Lexio/blob/main/docs/evaluation.md',
      },
    },
    {
      id: 'pythinq',
      title: 'PythinQ demand forecasting',
      kind: 'company',
      ownership: 'Built at ExD',
      problem:
        'A beverage-bottling client forecast demand manually in Excel and needed daily forecasts at 4 grains from 4.9M sales rows.',
      result:
        'Routes by demand shape: Huber LightGBM globally, a quantile model for 27 high-variance Material SKUs, and two-stage occurrence/magnitude models for 10,000+ limited-history series across three grains. Runs on a Medallion PostgreSQL store with viewer/analyst/admin RBAC and a Postgres-backed async worker, with a planner workflow: draft/publish, audited edits, a 7-business-day freeze and needs-attention flags.',
      stack: [
        'FastAPI',
        'React',
        'TypeScript',
        'Vite',
        'Tailwind CSS',
        'PostgreSQL',
        'LightGBM',
        'Optuna',
        'Docker',
      ],
      headline: 'Material-level WAPE 36% vs 52% for a 28-day average',
      featured: true,
      flow: [
        'Ingest sales data',
        'Route each series by demand shape',
        'Train LightGBM (Huber, quantile, two-stage)',
        'Tune with Optuna, 7-fold walk-forward',
        'Planners draft, edit and publish',
      ],
      validation:
        '2025 holdout, one-step-ahead: material-level WAPE is 36% vs 52% for a 28-day average. Leakage-safe pandas features with hard-fail checks for missing weather/events, covered by 2,300+ tests (pytest, Ruff, basedpyright).',
      confidential: true,
    },
    {
      id: 'omnix',
      title: 'Omnix AI',
      kind: 'company',
      ownership: 'Built the UI overhaul at ExD',
      problem:
        'A multi-model AI debate app needed its UI overhauled and clear rules for who sits on a debate panel.',
      result:
        'New stylesheet, a 5-step panel-creation wizard, a debate-room list and a sidebar in Django templates and vanilla JavaScript. Defined the roster rules (1 Super Expert plus 3-9 debate experts), added persona management and debate-output normalization, and fixed persona-generation token limits for Anthropic models.',
      stack: ['Django', 'PostgreSQL', 'JavaScript', 'OpenAI', 'Anthropic', 'Gemini', 'xAI'],
      headline: '5-step panel wizard, 1 Super Expert plus 3-9 experts',
      featured: true,
      confidential: true,
    },
    {
      id: 'dga-detection',
      title: 'DGA Domain Detection',
      kind: 'company',
      ownership: 'Built during the Ebryx ML internship',
      problem:
        'Malware uses domain generation algorithms to churn out command-and-control domains faster than blocklists can keep up.',
      result:
        'DeepD2V (Word2Vec + 1D CNN) reached 0.94 holdout accuracy on 200k domains, beating n-gram and Word2Vec baselines; shipped with a Flask API and React UI.',
      stack: ['Python', 'Word2Vec', 'Keras', 'Flask', 'React'],
      headline: '0.94 holdout accuracy on 200k domains',
      featured: true,
      flow: ['Domain name', 'Word2Vec embedding', '1D CNN classifier', 'Flask API and React UI'],
      validation: 'Held-out 200k-domain set, compared against n-gram and Word2Vec baselines.',
      links: { code: 'https://github.com/rumanmlk/DGA-Detection' },
    },
    {
      id: 'exd-odoo',
      title: 'ExD Odoo operations platform',
      kind: 'company',
      ownership: 'Mentored the intern cohort and ran deployment',
      problem:
        'ExD replaced ad-hoc time tracking with a custom Odoo 19 platform of 20+ addons that had to go live company-wide, built largely by an intern cohort.',
      result:
        'Stood up the deployment stack, coached the interns through merge-ready fixes and onboarded their replacement; the platform is now used daily across the company.',
      stack: ['Odoo 19', 'Python', 'PostgreSQL'],
      headline: '20+ addons live company-wide',
      confidential: true,
    },
    {
      id: 'multi-tenant-ecommerce',
      title: 'Multi-tenant eCommerce platform',
      kind: 'company',
      ownership: 'Built at Core Edge Solutions',
      problem:
        'Serve isolated storefronts and admin panels for many tenants from one platform, and also run in single-tenant mode.',
      result:
        'A multi-tenant Next.js and PostgreSQL platform with isolated storefronts and admin, a single-tenant mode, pluggable uploads on local disk or MinIO, and GitHub Actions CI/CD: deploy to dev on every push, manual promotion to staging.',
      stack: ['Next.js', 'PostgreSQL', 'MinIO', 'GitHub Actions'],
      headline: 'Isolated storefronts and admin per tenant',
      confidential: true,
    },
    {
      id: 'rice-quality-check',
      title: 'Rice Quality Check',
      kind: 'university',
      ownership: 'Final year project, team of 3',
      problem: 'Classify 8 Pakistani rice varieties and detect adulteration from grain images.',
      result: '92% average accuracy across 6 fine-tuned models on 10,000+ grain images.',
      stack: ['Computer Vision', 'FastAPI', 'React', 'MongoDB'],
      headline: '92% average accuracy, 8 rice varieties',
    },
  ] satisfies Project[] as Project[],

  experience: [
    {
      company: 'Excellence Delivered (ExD)',
      role: 'Associate Software Engineer',
      start: '2026-03',
      end: 'Present',
      summary:
        'Builds a daily demand-forecasting platform for a beverage-bottling client, built the UI overhaul of a multi-model AI debate app, and mentored the intern cohort behind the internal Odoo platform.',
      projects: ['PythinQ demand forecasting', 'Omnix AI', 'ExD Odoo operations platform'],
    },
    {
      company: 'Core Edge Solutions',
      role: 'Full Stack Developer (Next.js)',
      start: '2025-12',
      end: '2026-02',
      summary:
        'Built a multi-tenant Next.js/PostgreSQL eCommerce platform with pluggable uploads and GitHub Actions CI/CD: deploy to dev on every push, manual promotion to staging.',
      projects: ['Multi-tenant eCommerce platform'],
    },
    {
      company: 'TAG Solutions (TAGS)',
      role: 'Python Intern',
      start: '2025-09',
      end: '2025-10',
      summary:
        'Built and deployed a full-stack app (React, Node.js, MongoDB Atlas) with Docker and GitHub Actions to Docker Hub and Render, and converted Django advertisement-marketplace pages to a Django + React (Vite) hybrid.',
    },
    {
      company: 'Ebryx',
      role: 'Machine Learning Intern',
      start: '2024-06',
      end: '2024-09',
      summary:
        'Built a DGA (Domain Generation Algorithm) detection system using DeepD2V embeddings on 200,000+ domain records, outperforming n-gram and Word2Vec baselines.',
      projects: ['DGA Domain Detection'],
    },
  ] satisfies Role[] as Role[],

  education: [
    {
      school: 'FAST National University of Computer and Emerging Sciences',
      shortName: 'FAST-NUCES',
      degree: 'BS Computer Science',
      start: '2021-08',
      end: '2025-06',
    },
  ] satisfies Education[] as Education[],

  stack: [
    {
      group: 'LANGUAGES',
      items: [
        { name: 'Python', icon: 'python' },
        { name: 'TypeScript', icon: 'typescript' },
        { name: 'JavaScript', icon: 'javascript' },
        { name: 'SQL', mono: 'SQL' },
      ],
    },
    {
      group: 'BACKEND & DATA',
      items: [
        { name: 'FastAPI', icon: 'fastapi' },
        { name: 'Django', icon: 'django' },
        { name: 'SQLAlchemy', icon: 'sqlalchemy' },
        { name: 'Node.js', icon: 'nodedotjs' },
        { name: 'PostgreSQL', icon: 'postgresql' },
        { name: 'MongoDB', icon: 'mongodb' },
      ],
    },
    {
      group: 'FRONTEND',
      items: [
        { name: 'React', icon: 'react' },
        { name: 'Next.js', icon: 'nextdotjs' },
        { name: 'Vite', icon: 'vite' },
        { name: 'Tailwind CSS', icon: 'tailwindcss' },
      ],
    },
    {
      group: 'AI / ML',
      items: [
        { name: 'Forecasting', mono: 'FCST' },
        { name: 'LightGBM', mono: 'LGBM' },
        { name: 'pandas', icon: 'pandas' },
        { name: 'Computer Vision', mono: 'CV' },
        { name: 'RAG', mono: 'RAG' },
        { name: 'Embeddings', mono: 'EMB' },
        { name: 'pgvector', mono: 'PGV' },
        { name: 'Hybrid search', mono: 'HYB' },
        { name: 'LLM evaluation', mono: 'EVAL' },
      ],
    },
    {
      group: 'LLM APIS',
      items: [
        { name: 'OpenAI', icon: 'openai' },
        { name: 'Anthropic', icon: 'anthropic' },
        { name: 'Gemini', icon: 'googlegemini' },
        { name: 'xAI', icon: 'xai' },
        { name: 'Groq', mono: 'GROQ' },
      ],
    },
    {
      group: 'DEVOPS',
      items: [
        { name: 'Docker', icon: 'docker' },
        { name: 'GitHub Actions', icon: 'githubactions' },
        { name: 'pytest', icon: 'pytest' },
        { name: 'Ruff', icon: 'ruff' },
        { name: 'MinIO', icon: 'minio' },
        { name: 'Vercel', icon: 'vercel' },
        { name: 'Neon', icon: 'neon' },
        { name: 'Langfuse', mono: 'LF' },
      ],
    },
  ] satisfies StackGroup[],

  writing: [] as Post[],

  features,

  /** Locked UI wording. Change with care: the spec fixes these strings (see chrome.ts). */
  ui: chrome.ui,
} as const satisfies ContentShape;

/* ---------- Shape used only to validate the object above ---------- */

type ContentShape = {
  site: {
    name: string;
    shortName: string;
    title: string;
    description: string;
    email: string;
    url: string;
    location: string;
    locationNote: string;
    employer: { name: string; url: string };
    keywords: readonly string[];
  };
  socials: { github: string; linkedin: string; resume: string };
  hero: { lines: readonly string[]; pitch: string };
  intro: { lines: readonly string[] };
  projects: Project[];
  experience: Role[];
  education: Education[];
  stack: readonly StackGroup[];
  writing: Post[];
  features: { intro: boolean; planet: boolean; smoothScroll: boolean };
  ui: Record<string, unknown>;
};

export type Content = typeof content;

/** Sections in page order; Writing is dropped when it has no posts. */
export function getSections(): NavItem[] {
  const all: NavItem[] = [
    { id: 'work', label: content.ui.navLabels.work },
    { id: 'experience', label: content.ui.navLabels.experience },
    { id: 'stack', label: content.ui.navLabels.stack },
    { id: 'writing', label: content.ui.navLabels.writing },
    { id: 'contact', label: content.ui.navLabels.contact },
  ];
  return all.filter((s) => s.id !== 'writing' || content.writing.length > 0);
}
