import { adminConfigured, clientIp, fail, isAdmin, json, loginCookie, logoutCookie, passwordOk, tooMany } from '@/lib/server/admin-auth';

export const runtime = 'nodejs';

/** Is this browser already logged in? */
export async function GET(req: Request) {
  return json({ admin: isAdmin(req), configured: adminConfigured() });
}

export async function POST(req: Request) {
  if (!adminConfigured()) return fail(503, 'Admin is not set up yet: add ADMIN_SECRET (8+ characters) in Vercel → Settings → Environment Variables.');
  if (tooMany(`login:${clientIp(req)}`, 8, 10 * 60_000)) return fail(429, 'Too many attempts. Please wait a few minutes.');
  let password = '';
  try {
    password = String(((await req.json()) as { password?: unknown }).password ?? '');
  } catch {
    /* fall through */
  }
  if (!passwordOk(password)) return fail(401, 'Wrong password.');
  return json({ ok: true }, 200, { 'Set-Cookie': loginCookie() });
}

export async function DELETE() {
  return json({ ok: true }, 200, { 'Set-Cookie': logoutCookie() });
}
