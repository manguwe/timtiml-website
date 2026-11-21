import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { deleteFiles, updateDoc, type Doc } from '@/lib/portfolio';
import { sanitizePost } from '@/lib/site-content';
import { fail, isAdmin, json } from '@/lib/server/admin-auth';
import { blobToken, NO_STORAGE_MESSAGE } from '@/lib/server/blob-token';

export const runtime = 'nodejs';

/** Remove journal pictures that no post uses any more (e.g. after you remove a picture or delete a post). */
function dropOrphans(doc: Doc, removed: string[]): Doc {
  const used = new Set(doc.posts.flatMap((p) => p.images));
  const orphans = doc.items.filter((i) => i.kind === 'post' && !used.has(i.url));
  removed.push(...orphans.map((o) => o.url));
  return { ...doc, items: doc.items.filter((i) => !orphans.includes(i)) };
}

/** Create or edit a journal post. Body: { id?, title, date (YYYY-MM-DD), body, images: [urls from /api/admin/upload] }. */
export async function POST(req: Request) {
  if (!isAdmin(req)) return fail(401, 'Please log in.');
  if (!blobToken()) return fail(503, NO_STORAGE_MESSAGE);
  let raw: { id?: unknown } & Record<string, unknown> = {};
  try {
    raw = await req.json();
  } catch {
    return fail(400, 'Bad request.');
  }
  const clean = sanitizePost(raw);
  if (!clean) return fail(400, 'A post needs a title and a date.');
  const removed: string[] = [];
  let saved = null as null | { id: string };
  try {
    await updateDoc((doc) => {
      // Pictures must be ones uploaded through this site.
      const owned = new Set(doc.items.filter((i) => i.kind === 'post').map((i) => i.url));
      const images = clean.images.filter((u) => owned.has(u));
      const existing = typeof raw.id === 'string' ? doc.posts.find((p) => p.id === raw.id) : undefined;
      const post = { ...clean, images, id: existing?.id ?? randomUUID(), createdAt: existing?.createdAt ?? new Date().toISOString() };
      saved = { id: post.id };
      const posts = existing ? doc.posts.map((p) => (p.id === post.id ? post : p)) : [post, ...doc.posts];
      return dropOrphans({ ...doc, posts }, removed);
    });
    await deleteFiles(removed);
    revalidatePath('/', 'layout');
    return json({ ok: true, ...saved });
  } catch {
    return fail(503, 'Could not save the post.');
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return fail(401, 'Please log in.');
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return fail(400, 'Bad request.');
  const removed: string[] = [];
  try {
    await updateDoc((doc) => dropOrphans({ ...doc, posts: doc.posts.filter((p) => p.id !== id) }, removed));
    await deleteFiles(removed);
    revalidatePath('/', 'layout');
    return json({ ok: true });
  } catch {
    return fail(503, 'Could not delete the post.');
  }
}
