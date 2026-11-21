import { revalidatePath } from 'next/cache';
import { updateDoc } from '@/lib/portfolio';
import { sanitizeContent } from '@/lib/site-content';
import { fail, isAdmin, json } from '@/lib/server/admin-auth';
import { blobToken, NO_STORAGE_MESSAGE } from '@/lib/server/blob-token';

export const runtime = 'nodejs';

/** Save all the site's editable text (hero, about, skills, projects, offers, contact…). */
export async function PUT(req: Request) {
  if (!isAdmin(req)) return fail(401, 'Please log in.');
  if (!blobToken()) return fail(503, NO_STORAGE_MESSAGE);
  let body: { content?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return fail(400, 'Bad request.');
  }
  const content = sanitizeContent(body.content);
  try {
    await updateDoc((doc) => ({ ...doc, content }));
    revalidatePath('/', 'layout');
    return json({ ok: true, content });
  } catch {
    return fail(503, 'Could not save. Is the Blob store connected to this project?');
  }
}
