import defaults from '@/data/content.json';

/* ── Everything below is editable from /admin. data/content.json only supplies the starting text. ── */

export const STATUSES = ['Live', 'In development', 'Planned', 'Exploring'] as const;
export type ProjectStatus = (typeof STATUSES)[number];

export const STATUS_GROUPS: { status: ProjectStatus; title: string }[] = [
  { status: 'Live', title: '✅ Developed & Live' },
  { status: 'In development', title: '🛠️ Currently in Development' },
  { status: 'Planned', title: '🗓️ Planned' },
  { status: 'Exploring', title: '🔭 Continuous Exploration' },
];

export interface Project {
  id: string; icon: string; status: ProjectStatus; title: string; desc: string;
  role: string; collaborator: string; features: string[]; meta: string[];
  links: { label: string; href: string }[]; inCv: boolean;
}
export interface Education { level: string; title: string; school: string; areas: string[] }
export interface Offer { icon: string; title: string; text: string }
export interface Contact {
  email: string; phone: string; whatsapp: string; location: string;
  github: string; linkedin: string; telegram: string; instagram: string; facebook: string; threads: string; whatsappChannel: string;
}
export interface SiteContent {
  hero: { tag: string; tagline: string; sub: string };
  glance: { year: string; title: string; text: string }[];
  about: { paragraphs: string[]; motto: string; philosophy: string; approach: string[] };
  education: Education[];
  skillGroups: { label: string; items: string[] }[];
  interests: string[];
  career: { text: string; objective: string };
  offers: { intro: string; items: Offer[] };
  projects: Project[];
  contact: Contact;
}
export interface Post { id: string; title: string; date: string; body: string; images: string[]; createdAt: string }

export const DEFAULT_CONTENT = defaults as unknown as SiteContent;

/* ── Validation: whatever arrives from the admin is trimmed, capped and coerced before it is saved. ── */
const str = (v: unknown, max: number, fallback = ''): string => (typeof v === 'string' ? v.trim().slice(0, max) : fallback);
const list = <T,>(v: unknown, max: number, each: (x: unknown) => T | null): T[] =>
  (Array.isArray(v) ? v : []).slice(0, max).map(each).filter((x): x is T => x !== null);
const strList = (v: unknown, max = 30, len = 200): string[] => list(v, max, (x) => str(x, len) || null);
const url = (v: unknown): string => {
  const s = str(v, 500);
  return /^(https?:\/\/|mailto:)/i.test(s) ? s : '';
};
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'project';

export function sanitizeContent(input: unknown, base: SiteContent = DEFAULT_CONTENT): SiteContent {
  const r = obj(input);
  const has = (k: string) => k in r;
  const hero = obj(r.hero), about = obj(r.about), career = obj(r.career), offers = obj(r.offers), contact = obj(r.contact);
  const used = new Set<string>();
  return {
    hero: has('hero')
      ? { tag: str(hero.tag, 120), tagline: str(hero.tagline, 160), sub: str(hero.sub, 500) }
      : base.hero,
    glance: has('glance')
      ? list(r.glance, 6, (x) => { const g = obj(x); const title = str(g.title, 80); return title ? { year: str(g.year, 40), title, text: str(g.text, 300) } : null; })
      : base.glance,
    about: has('about')
      ? { paragraphs: strList(about.paragraphs, 12, 1500), motto: str(about.motto, 120), philosophy: str(about.philosophy, 400), approach: strList(about.approach, 20, 60) }
      : base.about,
    education: has('education')
      ? list(r.education, 8, (x) => { const e = obj(x); const title = str(e.title, 160); return title ? { level: str(e.level, 60), title, school: str(e.school, 160), areas: strList(e.areas, 20, 80) } : null; })
      : base.education,
    skillGroups: has('skillGroups')
      ? list(r.skillGroups, 20, (x) => { const g = obj(x); const label = str(g.label, 60); return label ? { label, items: strList(g.items, 30, 80) } : null; })
      : base.skillGroups,
    interests: has('interests') ? strList(r.interests, 30, 60) : base.interests,
    career: has('career') ? { text: str(career.text, 600), objective: str(career.objective, 800) } : base.career,
    offers: has('offers')
      ? { intro: str(offers.intro, 300), items: list(offers.items, 12, (x) => { const o = obj(x); const title = str(o.title, 80); return title ? { icon: str(o.icon, 8) || '✨', title, text: str(o.text, 400) } : null; }) }
      : base.offers,
    projects: has('projects')
      ? list(r.projects, 40, (x) => {
          const p = obj(x); const title = str(p.title, 100); if (!title) return null;
          let id = slug(str(p.id, 60) || title); while (used.has(id)) id += '-2'; used.add(id);
          const status = (STATUSES as readonly string[]).includes(String(p.status)) ? (p.status as ProjectStatus) : 'Planned';
          return {
            id, icon: str(p.icon, 8) || '🚀', status, title, desc: str(p.desc, 900), role: str(p.role, 100), collaborator: str(p.collaborator, 100),
            features: strList(p.features, 20, 200), meta: strList(p.meta, 10, 60),
            links: list(p.links, 6, (l) => { const o = obj(l); const href = url(o.href); return href ? { label: str(o.label, 40) || 'Link', href } : null; }),
            inCv: p.inCv !== false,
          };
        })
      : base.projects,
    contact: has('contact')
      ? {
          email: str(contact.email, 120), phone: str(contact.phone, 40), whatsapp: str(contact.whatsapp, 20).replace(/\D/g, ''), location: str(contact.location, 80),
          github: url(contact.github), linkedin: url(contact.linkedin), telegram: url(contact.telegram), instagram: url(contact.instagram),
          facebook: url(contact.facebook), threads: url(contact.threads), whatsappChannel: url(contact.whatsappChannel),
        }
      : base.contact,
  };
}

/** Journal entry: title, a YYYY-MM-DD date, text, and picture URLs (which must be uploads this site owns — checked on the server). */
export function sanitizePost(input: unknown): Omit<Post, 'id' | 'createdAt'> | null {
  const p = obj(input);
  const title = str(p.title, 120);
  const date = str(p.date, 10);
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return null;
  return { title, date, body: str(p.body, 5000), images: strList(p.images, 12, 500) };
}
