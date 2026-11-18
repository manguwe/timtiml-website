import { loadItems } from '@/lib/portfolio';
import { fail, isAdmin, json } from '@/lib/server/admin-auth';
import { blobToken, NO_STORAGE_MESSAGE } from '@/lib/server/blob-token';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  if (!isAdmin(req)) return fail(401, 'Please log in.');
  if (!blobToken()) return fail(503, NO_STORAGE_MESSAGE);
  try {
    return json({ items: await loadItems() }, 200, { 'Cache-Control': 'no-store' });
  } catch {
    return fail(503, 'Could not reach file storage. Check the Blob store is connected to this project in Vercel → Storage, then Redeploy.');
  }
}
