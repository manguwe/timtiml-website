import { loadDoc, storageStatus } from '@/lib/portfolio';
import { DEFAULT_CONTENT, sanitizeContent } from '@/lib/site-content';
import { fail, isAdmin, json } from '@/lib/server/admin-auth';

export const runtime = 'nodejs';

/** Everything the admin screen needs in one go: uploads, current site text, journal posts, and storage health. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return fail(401, 'Please log in.');
  const storage = await storageStatus();
  if (!storage.ok) return json({ items: [], posts: [], content: DEFAULT_CONTENT, storage }, 200, { 'Cache-Control': 'no-store' });
  try {
    const doc = await loadDoc();
    return json({ items: doc.items, posts: doc.posts, content: sanitizeContent(doc.content ?? {}), storage }, 200, { 'Cache-Control': 'no-store' });
  } catch {
    return json({ items: [], posts: [], content: DEFAULT_CONTENT, storage: { ok: false, message: 'Storage answered but your saved data could not be read. Try again in a moment.' } });
  }
}
