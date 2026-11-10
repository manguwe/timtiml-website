import { put, del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import { updateItems, type DocCategory, type ItemKind, type PortfolioItem } from '@/lib/portfolio';
import { fail, isAdmin, json } from '@/lib/server/admin-auth';

export const runtime = 'nodejs';

/** Vercel functions accept request bodies up to 4.5 MB. */
const MAX_BYTES = 4.4 * 1024 * 1024;

const IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DOCS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];
const ALLOWED: Record<ItemKind, string[]> = {
  gallery: IMAGES,
  profile: IMAGES,
  document: [...DOCS, ...IMAGES],
  cv: DOCS,
};
const KINDS = Object.keys(ALLOWED) as ItemKind[];

const slug = (s: string) =>
  s.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'file';
const clean = (v: FormDataEntryValue | null, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(req: Request) {
  if (!isAdmin(req)) return fail(401, 'Please log in.');

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'Could not read the upload.');
  }
  const file = form.get('file');
  const kind = clean(form.get('kind'), 20) as ItemKind;
  if (!KINDS.includes(kind)) return fail(400, 'Unknown upload type.');
  if (!(file instanceof File) || file.size === 0) return fail(400, 'Please choose a file.');
  if (file.size > MAX_BYTES) return fail(413, 'That file is too big (4 MB maximum). Compress it and try again.');
  if (!ALLOWED[kind].includes(file.type)) return fail(415, kind === 'gallery' || kind === 'profile' ? 'Please upload a JPG, PNG, WebP or GIF picture.' : 'Please upload a PDF, Word, PowerPoint, Excel or image file.');

  const title = clean(form.get('title'), 100) || file.name.replace(/\.[^.]+$/, '').slice(0, 100);
  const note = clean(form.get('note'), 120);
  const category: DocCategory | null = kind === 'document' ? (clean(form.get('category'), 20) === 'certificate' ? 'certificate' : 'other') : null;

  try {
    const blob = await put(`portfolio/${kind}/${slug(file.name)}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    });
    const item: PortfolioItem = {
      id: randomUUID(),
      kind,
      title,
      note,
      category,
      url: blob.url,
      contentType: file.type,
      size: file.size,
      addedAt: new Date().toISOString(),
    };
    const replaced: string[] = [];
    await updateItems((items) => {
      // Profile picture and CV are single slots: a new upload replaces the old one.
      const keep = kind === 'profile' || kind === 'cv' ? items.filter((i) => (i.kind === kind ? (replaced.push(i.url), false) : true)) : items;
      return [item, ...keep];
    });
    if (replaced.length) await del(replaced).catch(() => undefined);
    revalidatePath('/', 'layout');
    return json({ ok: true, item });
  } catch {
    return fail(503, 'Could not save the file. Is Vercel Blob storage connected to this project?');
  }
}
