import raw from '@/data/content.json';

/* ── Types for the text content stored in data/content.json ── */
export interface ProjectLink { label: string; href: string }
export interface Project {
  icon: string; status: string; title: string; desc: string;
  role: string | null; collaborator: string | null;
  features: string[]; meta: string[]; links: ProjectLink[];
}

export interface Content {
  hero: { tag: string; tagline: string; sub: string };
  glance: { year: string; title: string; text: string }[];
  about: { paragraphs: string[]; motto: string; approach: string[]; philosophy: string };
  education: { level: string; title: string; school: string; areas: string[] };
  skillGroups: { label: string; items: string[] }[];
  interests: string[];
  career: { text: string; objective: string };
  projectGroups: { id: string; title: string; projects: Project[] }[];
  quickAccess: { icon: string; title: string; sub: string; href: string }[];
}

export const content = raw as unknown as Content;
