import type { PortfolioItem } from '@/lib/portfolio';
import { shrinkImage } from '@/lib/resize-image';

/** Uploads one file (pictures are shrunk first). Returns the saved item or throws a readable error. */
export async function uploadFile(kind: 'gallery' | 'document' | 'profile' | 'post', file: File, extra: Record<string, string> = {}): Promise<PortfolioItem> {
  const small = await shrinkImage(file, kind === 'profile' ? 900 : 1800);
  const form = new FormData();
  form.set('kind', kind);
  form.set('file', small);
  Object.entries(extra).forEach(([k, v]) => form.set(k, v));
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
  const data = (await res.json().catch(() => ({}))) as { error?: string; item?: PortfolioItem };
  if (!res.ok || !data.item) throw new Error(data.error ?? `Upload failed (${res.status}).`);
  return data.item;
}
