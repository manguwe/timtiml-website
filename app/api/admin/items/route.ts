import { loadItems } from '@/lib/portfolio';
import { fail, isAdmin, json } from '@/lib/server/admin-auth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  if (!isAdmin(req)) return fail(401, 'Please log in.');
  try {
    return json({ items: await loadItems() }, 200, { 'Cache-Control': 'no-store' });
  } catch {
    return fail(503, 'File storage is not connected yet. In Vercel: Storage → Create → Blob, then connect it to this project.');
  }
}
