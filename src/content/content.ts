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
  links?: { live?: string; code?: string; paper?: string };
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
      'Software engineer in Lahore building production ML and LLM systems: demand forecasting and multi-provider LLM routing with FastAPI, React, LightGBM and PostgreSQL.',
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
      'PyTorch',
      'FastAPI',
      'React',
      'PostgreSQL',
      'LightGBM',
      'Docker',
      'LLM',
      'Lahore',
      'Pakistan',
    ],
  },

  socials: {
    github: 'https://github.com/rumanmlk',
    linkedin: 'https://www.linkedin.com/in/ruman-malik',
    resume: '/resume.pdf?v=5',
  },

  hero: {
    lines: ['I build AI', 'that ships.'],
    pitch:
      'Software engineer at ExD. I build the parts that keep ML and LLM products alive in production: model routing, provider failover, async workers and CI that catches drift before users do.',
  },

  intro: {
    lines: chrome.introLines,
  },

  projects: [
    {
      id: 'pythinq',
      title: 'PythinQ demand forecasting',
      kind: 'company',
      ownership: 'Built end to end at ExD',
      problem:
        'Planners at a beverage company needed daily forecasts across 4 grains for about 5M sales rows, including 10,000+ sparse series that one global model gets wrong.',
      result:
        'Routes each series to the right LightGBM model (Huber, quantile, two-stage occurrence/magnitude), tuned with Optuna and 7-fold walk-forward validation; planners upload, train, forecast and review a full-year holdout in one UI.',
      stack: ['FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'LightGBM', 'Optuna', 'Docker'],
      headline: '5M sales rows, 4 forecast grains, 10,000+ series',
      featured: true,
      flow: [
        'Upload sales data',
        'Route each series by demand shape',
        'Train LightGBM (Huber, quantile, two-stage)',
        'Walk-forward tuning with Optuna',
        'Review a full-year holdout',
      ],
      validation:
        '7-fold walk-forward validation, then a full-year holdout that planners review in the UI.',
      confidential: true,
    },
    {
      id: 'omnix',
      title: 'Omnix AI',
      kind: 'company',
      ownership: 'Core contributor at ExD',
      problem:
        'A panel of LLM expert personas debates a policy question over three rounds, so one provider outage or rate limit used to kill a multi-minute debate mid-run.',
      result:
        'One routing layer across OpenAI, Anthropic, Gemini and xAI with primary/fallback pairs and retries, async jobs with per-user locks, and a Django test suite covering roster rules, fallback logic and cost accounting.',
      stack: ['Django', 'PostgreSQL', 'OpenAI', 'Anthropic', 'Gemini', 'xAI'],
      headline: '4 LLM providers, automatic failover',
      featured: true,
      flow: [
        'Policy question',
        'Routing layer: primary and fallback',
        'OpenAI, Anthropic, Gemini, xAI',
        'Async worker with per-user locks',
        'Three-round debate',
      ],
      validation: 'Django test suite covering roster rules, fallback logic and cost accounting.',
      confidential: true,
    },
    {
      id: 'lexio',
      title: 'Lexio AI Legal Counsel',
      kind: 'personal',
      ownership: 'Built from scratch',
      problem:
        'Legal Q&A assistants hallucinate; users need answers grounded in the document they uploaded and nothing else.',
      result:
        'FAISS retrieval with MMR over PDF chunks feeds a prompt that answers only from context and declines when the answer is not present.',
      stack: ['LangChain', 'FAISS', 'Ollama', 'Groq', 'Streamlit'],
      headline: 'Answers only from your document, or declines',
      featured: true,
      flow: [
        'Upload PDF',
        'Chunk and embed',
        'FAISS retrieval with MMR',
        'Answer only from context',
        'Decline when absent',
      ],
      links: { code: 'https://github.com/rumanmlk/Lexio' },
    },
    {
      id: 'dga-detection',
      title: 'DGA Domain Detection',
      kind: 'company',
      ownership: 'Built during the Ebryx ML internship',
      problem:
        'Malware uses domain generation algorithms to churn out command-and-control domains faster than blocklists can keep up.',
      result:
        'DeepD2V (Word2Vec + 1D CNN) reached 0.94 holdout accuracy on 200k domains, beating n-gram and reputation baselines; shipped with a Flask API and React UI.',
      stack: ['Python', 'Word2Vec', 'Keras', 'Flask', 'React'],
      headline: '0.94 holdout accuracy on 200k domains',
      featured: true,
      flow: ['Domain name', 'Word2Vec embedding', '1D CNN classifier', 'Flask API and React UI'],
      validation: 'Held-out 200k-domain set, compared against n-gram and reputation baselines.',
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
      ownership: 'Built from scratch at Core Edge Solutions',
      problem:
        'One codebase had to serve many storefronts and admin panels on shared infrastructure, and also run in single-tenant mode.',
      result:
        'Isolated per-tenant storefronts and admin on PostgreSQL, a pluggable upload layer (local filesystem or MinIO), and GitHub Actions that build, test and deploy on every push.',
      stack: ['Next.js', 'PostgreSQL', 'MinIO', 'GitHub Actions'],
      headline: 'One codebase, many tenants',
      confidential: true,
    },
    {
      id: 'rice-quality-check',
      title: 'Rice Quality Check',
      kind: 'university',
      ownership: 'Final year project, team of 3',
      problem:
        'Classify 8 Pakistani rice varieties and detect adulteration from grain images, a check that mills and buyers still do by eye.',
      result:
        '92% average accuracy across 6 fine-tuned vision models on 10,000+ captured grain images, served through a FastAPI backend and a React UI.',
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
        'Ships ML and LLM products end to end, and mentored the intern cohort behind the internal Odoo platform.',
      projects: ['PythinQ demand forecasting', 'Omnix AI', 'ExD Odoo operations platform'],
    },
    {
      company: 'Core Edge Solutions',
      role: 'Full Stack Developer (Next.js)',
      start: '2025-12',
      end: '2026-02',
      summary:
        'Built a multi-tenant eCommerce platform with a pluggable upload layer and GitHub Actions deploys.',
      projects: ['Multi-tenant eCommerce platform'],
    },
    {
      company: 'TAG Solutions (TAGS)',
      role: 'Python Intern',
      start: '2025-09',
      end: '2025-10',
      summary:
        'Shipped a React, Node.js and MongoDB app with Docker and GitHub Actions, converted Django marketplace pages to a Django + React hybrid, and tracked reliability with Loki, Prometheus and Grafana.',
    },
    {
      company: 'Ebryx',
      role: 'Machine Learning Intern',
      start: '2024-06',
      end: '2024-09',
      summary:
        'Built a DGA detection system on 200k domain records that beat n-gram and reputation baselines.',
      projects: ['DGA Domain Detection'],
    },
  ] satisfies Role[] as Role[],

  stack: [
    {
      group: 'LANGUAGES',
      items: [
        { name: 'Python', icon: 'python' },
        { name: 'TypeScript', icon: 'typescript' },
        { name: 'Rust', icon: 'rust' },
      ],
    },
    {
      group: 'AI / ML',
      items: [
        { name: 'PyTorch', icon: 'pytorch' },
        { name: 'scikit-learn', icon: 'scikitlearn' },
        { name: 'pandas', icon: 'pandas' },
        { name: 'LightGBM', mono: 'LGBM' },
        { name: 'Optuna', icon: 'optuna' },
        { name: 'LangChain', icon: 'langchain' },
        { name: 'FAISS', icon: 'faiss' },
      ],
    },
    {
      group: 'BACKEND',
      items: [
        { name: 'FastAPI', icon: 'fastapi' },
        { name: 'Django', icon: 'django' },
        { name: 'Node.js', icon: 'nodedotjs' },
        { name: 'PostgreSQL', icon: 'postgresql' },
        { name: 'MongoDB', icon: 'mongodb' },
        { name: 'MinIO', icon: 'minio' },
      ],
    },
    {
      group: 'LLM APIS',
      items: [
        { name: 'OpenAI', icon: 'openai' },
        { name: 'Anthropic', icon: 'anthropic' },
        { name: 'Gemini', icon: 'googlegemini' },
        { name: 'xAI', icon: 'xai' },
      ],
    },
    {
      group: 'FRONTEND',
      items: [
        { name: 'React', icon: 'react' },
        { name: 'Next.js', icon: 'nextdotjs' },
        { name: 'Tailwind CSS', icon: 'tailwindcss' },
      ],
    },
    {
      group: 'DEVOPS',
      items: [
        { name: 'Docker', icon: 'docker' },
        { name: 'Kubernetes', icon: 'kubernetes' },
        { name: 'GitHub Actions', icon: 'githubactions' },
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
