import { del, list, put } from '@vercel/blob';
import { blobToken } from '@/lib/server/blob-token';
import { DEFAULT_CONTENT, sanitizeContent, type Post, type SiteContent } from '@/lib/site-content';

/** Everything you upload from /admin is described by one of these. */
export type ItemKind = 'gallery' | 'document' | 'profile' | 'post';
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
  gallery: PortfolioItem[];
  certificates: PortfolioItem[];
  documents: PortfolioItem[];
}

/** One small JSON document stored next to your pictures: uploads list + edited site text + journal posts. */
export interface Doc {
  version: 2;
  items: PortfolioItem[];
  content: Partial<SiteContent> | null;
  posts: Post[];
}

const PREFIX = 'portfolio/manifest';
const EMPTY_DOC = (): Doc => ({ version: 2, items: [], content: null, posts: [] });

/**
 * Every change writes a NEW file (random name) and removes the old one, so visitors never see a stale CDN copy.
 */
async function readDoc(): Promise<{ doc: Doc; urls: string[] }> {
  const { blobs } = await list({ prefix: PREFIX, limit: 100, token: blobToken() });
  if (!blobs.length) return { doc: EMPTY_DOC(), urls: [] };
  const newest = [...blobs].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
  const res = await fetch(newest.url, { cache: 'no-store' });
  const raw = res.ok ? ((await res.json()) as Partial<Doc>) : {};
  const doc: Doc = {
    version: 2,
    items: (Array.isArray(raw.items) ? raw.items : []).filter((i) => ['gallery', 'document', 'profile', 'post'].includes(i.kind)),
    content: raw.content && typeof raw.content === 'object' ? raw.content : null,
    posts: Array.isArray(raw.posts) ? raw.posts : [],
  };
  return { doc, urls: blobs.map((b) => b.url) };
}

export async function loadDoc(): Promise<Doc> {
  return (await readDoc()).doc;
}

/** Save a change. `change` receives the current document and returns the new one. */
export async function updateDoc(change: (doc: Doc) => Doc): Promise<Doc> {
  const { doc, urls } = await readDoc();
  const next = change(doc);
  await put(`${PREFIX}.json`, JSON.stringify(next), {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'application/json',
    token: blobToken(),
  });
  if (urls.length) await del(urls, { token: blobToken() }).catch(() => undefined);
  return next;
}

/** Remove files from storage (used when an upload is replaced or deleted). */
export async function deleteFiles(urls: string[]): Promise<void> {
  if (urls.length) await del(urls, { token: blobToken() }).catch(() => undefined);
}

export function group(items: PortfolioItem[]): Portfolio {
  const byNewest = (a: PortfolioItem, b: PortfolioItem) => +new Date(b.addedAt) - +new Date(a.addedAt);
  const of = (k: ItemKind) => items.filter((i) => i.kind === k).sort(byNewest);
  const docs = of('document');
  return {
    profile: of('profile')[0] ?? null,
    gallery: of('gallery'),
    certificates: docs.filter((d) => d.category === 'certificate'),
    documents: docs.filter((d) => d.category !== 'certificate'),
  };
}

export interface Site { content: SiteContent; posts: Post[]; portfolio: Portfolio }

const EMPTY_PORTFOLIO: Portfolio = { profile: null, gallery: [], certificates: [], documents: [] };

/**
 * For the public pages. Edited text wins over the built-in starting text.
 * If storage isn't connected yet (or is down) the site simply shows the starting text and empty sections.
 */
export async function getSite(): Promise<Site> {
  try {
    const doc = await loadDoc();
    return {
      content: sanitizeContent(doc.content ?? {}, DEFAULT_CONTENT),
      posts: [...doc.posts].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
      portfolio: group(doc.items),
    };
  } catch {
    return { content: DEFAULT_CONTENT, posts: [], portfolio: EMPTY_PORTFOLIO };
  }
}

/** Is storage reachable? Used by the admin screen to explain problems in plain words. */
export async function storageStatus(): Promise<{ ok: boolean; message: string }> {
  const token = blobToken();
  if (!token) return { ok: false, message: 'No storage key found. In Vercel → Settings → Environment Variables there must be a variable ending in _READ_WRITE_TOKEN (created when you connect the Blob store). After adding or changing it, Redeploy.' };
  try {
    await list({ limit: 1, token });
    return { ok: true, message: 'Storage is connected.' };
  } catch (e) {
    const detail = e instanceof Error ? e.message.slice(0, 200) : 'unknown error';
    return { ok: false, message: `A storage key exists but Vercel refused it: ${detail}. Re-connect the Blob store to this project (Storage tab), then Redeploy.` };
  }
}
