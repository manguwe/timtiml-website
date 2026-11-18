/**
 * Vercel names the storage key after the prefix chosen when the Blob store was connected
 * (BLOB_READ_WRITE_TOKEN by default, or e.g. TIM_READ_WRITE_TOKEN). We accept either.
 */
export function blobToken(): string | undefined {
  const env = process.env;
  if (env.BLOB_READ_WRITE_TOKEN) return env.BLOB_READ_WRITE_TOKEN;
  const other = Object.keys(env).find((k) => k.endsWith('_READ_WRITE_TOKEN') && env[k]);
  return other ? env[other] : undefined;
}

export const NO_STORAGE_MESSAGE =
  'No storage key found. In Vercel → Settings → Environment Variables there must be a variable ending in _READ_WRITE_TOKEN (created when you connect the Blob store). After adding or changing it, Redeploy.';
