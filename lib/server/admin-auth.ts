import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'ttml_admin';
const TTL = 60 * 60 * 24 * 7; // stay logged in for 7 days

const secret = () => process.env.ADMIN_SECRET ?? '';
const sign = (data: string) => createHmac('sha256', secret()).update(data).digest('base64url');

export function safeEqual(a: string, b: string): boolean {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

/** The admin password is ADMIN_SECRET. It must be set (8+ characters) or admin stays locked. */
export const adminConfigured = () => secret().length >= 8;

export function passwordOk(given: string): boolean {
  return adminConfigured() && safeEqual(given, secret());
}

export function loginCookie(): string {
  const body = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TTL })).toString('base64url');
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${body}.${sign(body)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${TTL}${secure}`;
}

export const logoutCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;

export function isAdmin(req: Request): boolean {
  if (!adminConfigured()) return false;
  const raw = (req.headers.get('cookie') ?? '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  const [body, sig] = (raw?.slice(COOKIE.length + 1) ?? '').split('.');
  if (!body || !sig || !safeEqual(sig, sign(body))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { exp: number };
    return typeof exp === 'number' && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

/* Tiny best-effort limiter (per server instance) to slow down password guessing. */
const hits = new Map<string, number[]>();
export function tooMany(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

export const json = (data: unknown, status = 200, headers?: Record<string, string>) => Response.json(data, { status, headers });
export const fail = (status: number, error: string) => json({ error }, status);
export const clientIp = (req: Request) => (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
