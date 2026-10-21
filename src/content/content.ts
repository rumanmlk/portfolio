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
  /** NDA work: shows a PRIVATE chip and hides links. */
  confidential?: boolean;
};

export type Role = {
  company: string;
  role: string;
  start: string;
  end: string | 'Present';
  /** Up to 3 bullets are rendered. */
  bullets: string[];
  stack: string[];
};

export type Post = { title: string; date: string; url: string };

export type NavItem = { id: SectionId; label: string };

export type SectionId = 'work' | 'experience' | 'stack' | 'writing' | 'contact';

export type StackItem = {
  name: string;
  /** simple-icons slug. Omitted when the tool has no official logo. */
  icon?: string;
  /** Short text shown in the cell when there is no logo. */
  mono?: string;
};

export type StackGroup = { group: string; items: StackItem[] };

export const content = {
  site: {
    name: chrome.siteName,
    shortName: chrome.shortName,
    title: 'AI Engineer',
    description:
      'Software engineer in Lahore shipping production demand forecasting and multi-provider LLM systems with FastAPI, React, LightGBM and PostgreSQL.',
    email: 'rumanmlk123@gmail.com',
    url: SITE_URL,
    location: 'Lahore, Pakistan',
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
    resume: '/resume.pdf?v=4',
  },

  status: {
    openToRoles: true,
  },

  hero: {
    lines: ['I build AI', 'that ships.'],
    pitch:
      'Full-stack engineer at ExD. I build the parts that keep ML and LLM products alive in production: model routing, provider failover, async workers and CI that catches drift before users do.',
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
      links: { code: 'https://github.com/rumanmlk/DGA-Detection' },
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
      links: { code: 'https://github.com/rumanmlk/Lexio' },
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
      confidential: true,
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
      confidential: true,
    },
  ] satisfies Project[] as Project[],

  experience: [
    {
      company: 'Excellence Delivered (ExD)',
      role: 'Associate Software Engineer',
      start: '2026',
      end: 'Present',
      bullets: [
        'Shipped PythinQ, a 4-grain demand-forecasting product on about 5M sales rows, with model routing by demand shape and 7-fold walk-forward tuning.',
        'Built the LLM routing layer for Omnix AI across 4 providers with fallback and retries, and moved multi-minute debate runs onto an async worker.',
        "Mentored the intern cohort that built ExD's Odoo platform and stood up its deployment stack through company-wide rollout.",
      ],
      stack: ['FastAPI', 'Django', 'React', 'PostgreSQL', 'LightGBM', 'Docker'],
    },
    {
      company: 'Core Edge Solutions',
      role: 'Full Stack Developer (Next.js)',
      start: '2025',
      end: '2026',
      bullets: [
        'Built a multi-tenant eCommerce platform with Next.js and PostgreSQL: isolated storefronts and admin on shared infrastructure, plus a single-tenant mode.',
        'Added a pluggable upload layer (local filesystem and MinIO) and GitHub Actions that build, test and deploy to dev on every push, with manual promotion to staging and main.',
      ],
      stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'MinIO', 'GitHub Actions'],
    },
    {
      company: 'TAG Solutions (TAGS)',
      role: 'Python Intern',
      start: '2025',
      end: '2025',
      bullets: [
        'Built and deployed a full-stack app (React, Node.js, MongoDB Atlas) with Docker and GitHub Actions to Docker Hub and Render.',
        'Converted Django advertisement-marketplace pages to a Django + React (Vite) hybrid.',
        'Tracked performance and reliability with Loki, Prometheus and Grafana.',
      ],
      stack: ['React', 'Node.js', 'MongoDB', 'Django', 'Docker'],
    },
    {
      company: 'Ebryx',
      role: 'Machine Learning Intern',
      start: '2024',
      end: '2024',
      bullets: [
        'Built a DGA detection system using DeepD2V embeddings on 200k domain records, outperforming n-gram and reputation baselines with 0.94 holdout accuracy.',
      ],
      stack: ['Python', 'Keras', 'Word2Vec', 'Flask'],
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
        { name: 'FAISS', mono: 'FAISS' },
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
    employer: { name: string; url: string };
    keywords: readonly string[];
  };
  socials: { github: string; linkedin: string; resume: string };
  status: { openToRoles: boolean };
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
