import { del, list, put } from '@vercel/blob';

/** Everything you upload from /admin is described by one of these. */
export type ItemKind = 'gallery' | 'document' | 'profile' | 'cv';
export type DocCategory = 'certificate' | 'other';

export interface PortfolioItem {
  id: string;
  kind: ItemKind;
  title: string;
  /** Short extra line, e.g. "Cisco · 2025". */
  note: string;
  category: DocCategory | null;
  url: string;
  contentType: string;
  size: number;
  addedAt: string;
}

export interface Portfolio {
  profile: PortfolioItem | null;
  cv: PortfolioItem | null;
  gallery: PortfolioItem[];
  certificates: PortfolioItem[];
  documents: PortfolioItem[];
}

interface Manifest { version: 1; items: PortfolioItem[] }

const PREFIX = 'portfolio/manifest';

/**
 * The list of uploaded items is a small JSON file stored next to your pictures in Vercel Blob.
 * Every change writes a NEW file (random name) and removes the old one, so visitors never see a stale CDN copy.
 */
async function readManifest(): Promise<{ manifest: Manifest; urls: string[] }> {
  const { blobs } = await list({ prefix: PREFIX, limit: 100 });
  if (!blobs.length) return { manifest: { version: 1, items: [] }, urls: [] };
  const newest = [...blobs].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
  const res = await fetch(newest.url, { cache: 'no-store' });
  const data = res.ok ? ((await res.json()) as Partial<Manifest>) : {};
  return { manifest: { version: 1, items: Array.isArray(data.items) ? data.items : [] }, urls: blobs.map((b) => b.url) };
}

export async function loadItems(): Promise<PortfolioItem[]> {
  return (await readManifest()).manifest.items;
}

/** Save a change to the item list. `change` receives the current items and returns the new ones. */
export async function updateItems(change: (items: PortfolioItem[]) => PortfolioItem[]): Promise<PortfolioItem[]> {
  const { manifest, urls } = await readManifest();
  const items = change(manifest.items);
  await put(`${PREFIX}.json`, JSON.stringify({ version: 1, items } satisfies Manifest), {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'application/json',
  });
  if (urls.length) await del(urls).catch(() => undefined);
  return items;
}

export function group(items: PortfolioItem[]): Portfolio {
  const byNewest = (a: PortfolioItem, b: PortfolioItem) => +new Date(b.addedAt) - +new Date(a.addedAt);
  const of = (k: ItemKind) => items.filter((i) => i.kind === k).sort(byNewest);
  const docs = of('document');
  return {
    profile: of('profile')[0] ?? null,
    cv: of('cv')[0] ?? null,
    gallery: of('gallery'),
    certificates: docs.filter((d) => d.category === 'certificate'),
    documents: docs.filter((d) => d.category !== 'certificate'),
  };
}

const EMPTY: Portfolio = { profile: null, cv: null, gallery: [], certificates: [], documents: [] };

/** For the public pages. If storage isn't connected yet (or is down) the site simply shows empty sections. */
export async function getPortfolio(): Promise<Portfolio> {
  try {
    return group(await loadItems());
  } catch {
    return EMPTY;
  }
}
