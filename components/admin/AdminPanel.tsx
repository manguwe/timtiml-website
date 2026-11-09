'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { PortfolioItem } from '@/lib/portfolio';
import { shrinkImage } from '@/lib/resize-image';

type Msg = { kind: 'ok' | 'error'; text: string } | null;
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);
const stem = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();

/** The whole "manage my site" screen: log in, then upload / rename / delete pictures and documents. No code editing. */
export function AdminPanel() {
  const [state, setState] = useState<'loading' | 'out' | 'in'>('loading');
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  // upload form state
  const [galleryFiles, setGalleryFiles] = useState<{ file: File; title: string }[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docNote, setDocNote] = useState('');
  const [docCategory, setDocCategory] = useState<'certificate' | 'other'>('certificate');
  const [editing, setEditing] = useState<{ id: string; title: string; note: string } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/items');
    if (res.status === 401) return setState('out');
    const data = (await res.json()) as { items?: PortfolioItem[]; error?: string };
    if (!res.ok) setMsg({ kind: 'error', text: data.error ?? 'Could not load your files.' });
    setItems(data.items ?? []);
    setState('in');
  }, []);

  useEffect(() => {
    fetch('/api/admin/login')
      .then((r) => r.json())
      .then((d: { admin: boolean; configured: boolean }) => {
        setConfigured(d.configured);
        return d.admin ? load() : setState('out');
      })
      .catch(() => setState('out'));
  }, [load]);

  async function login() {
    setMsg(null);
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) return setMsg({ kind: 'error', text: data.error ?? 'Login failed.' });
    setPassword('');
    await load();
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setItems([]);
    setState('out');
  }

  async function upload(kind: 'gallery' | 'document' | 'profile' | 'cv', file: File, extra: Record<string, string> = {}) {
    const small = await shrinkImage(file, kind === 'profile' ? 900 : 1800);
    const form = new FormData();
    form.set('kind', kind);
    form.set('file', small);
    Object.entries(extra).forEach(([k, v]) => form.set(k, v));
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? `Upload failed (${res.status}).`);
  }

  async function run(job: () => Promise<void>, done: string) {
    setBusy(true);
    setMsg(null);
    try {
      await job();
      await load();
      setMsg({ kind: 'ok', text: done });
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  }

  const uploadGallery = () =>
    run(async () => {
      for (const g of galleryFiles) await upload('gallery', g.file, { title: g.title });
      setGalleryFiles([]);
    }, `Added ${galleryFiles.length} picture${galleryFiles.length === 1 ? '' : 's'} to the gallery.`);

  const uploadDoc = () =>
    run(async () => {
      if (!docFile) return;
      await upload('document', docFile, { title: docTitle || stem(docFile.name), note: docNote, category: docCategory });
      setDocFile(null);
      setDocTitle('');
      setDocNote('');
    }, 'Document added.');

  const remove = (i: PortfolioItem) =>
    confirm(`Delete “${i.title}”? This cannot be undone.`) &&
    run(async () => {
      const res = await fetch(`/api/admin/item?id=${encodeURIComponent(i.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete.');
    }, 'Deleted.');

  const saveEdit = () =>
    editing &&
    run(async () => {
      const res = await fetch('/api/admin/item', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
      if (!res.ok) throw new Error('Could not save.');
      setEditing(null);
    }, 'Saved.');

  const profile = items.find((i) => i.kind === 'profile');
  const cv = items.find((i) => i.kind === 'cv');
  const gallery = items.filter((i) => i.kind === 'gallery');
  const docs = items.filter((i) => i.kind === 'document');

  // A plain function (not a component) so the edit boxes keep focus while you type.
  const card = (i: PortfolioItem, image = false) => (
    <div className="thumb" key={i.id}>
      {image || i.contentType.startsWith('image/') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={i.url} alt={i.title} />
      ) : (
        <div className="thumb-icon">{i.contentType === 'application/pdf' ? '📕' : '📄'}</div>
      )}
      <div className="thumb-body">
        {editing?.id === i.id ? (
          <>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Title" />
            <input value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} placeholder="Note (optional)" />
            <div className="thumb-actions">
              <button type="button" disabled={busy} onClick={saveEdit}>Save</button>
              <button type="button" className="danger" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div className="thumb-title">{i.title}</div>
            {i.note && <div className="thumb-note">{i.note}</div>}
            <div className="thumb-note">{kb(i.size)}{i.category ? ` · ${i.category}` : ''}</div>
            <div className="thumb-actions">
              <a href={i.url} target="_blank" rel="noopener noreferrer">Open</a>
              <button type="button" onClick={() => setEditing({ id: i.id, title: i.title, note: i.note })}>Edit</button>
              <button type="button" className="danger" disabled={busy} onClick={() => remove(i)}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">TIMTIML</Link>
        <div className="admin-nav-label">Manage my site</div>
      </nav>
      <div className="container">
        <div className="admin-top">
          <h1>🗂️ My <span>Portfolio</span></h1>
          {state === 'in' && <button type="button" onClick={logout}>Log out</button>}
        </div>

        {state === 'loading' && <p className="admin-hint">Loading…</p>}

        {state === 'out' && (
          <div className="admin-section">
            <h2>🔑 Log in</h2>
            <div className="auth-box">
              <input type="password" placeholder="Your admin password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && password && login()} />
              <button type="button" onClick={login} disabled={!password}>Log in</button>
            </div>
            {!configured && <p className="admin-hint admin-error">Not set up yet: add ADMIN_SECRET (8+ characters) in Vercel → Settings → Environment Variables, then redeploy.</p>}
          </div>
        )}

        {msg && <p className={`admin-hint ${msg.kind === 'ok' ? 'admin-ok' : 'admin-error'}`}>{msg.kind === 'ok' ? '✅ ' : '❌ '}{msg.text}</p>}

        {state === 'in' && (
          <>
            <p className="admin-lead">Upload here and your website updates by itself — no code needed. Pictures are shrunk automatically; documents can be up to 4 MB.</p>

            <div className="admin-section">
              <h2>🙂 Profile picture</h2>
              <div className="upload-row">
                <input type="file" accept="image/*" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void run(() => upload('profile', f), 'Profile picture updated.'); e.target.value = ''; }} />
              </div>
              {profile ? <div className="thumb-grid">{card(profile, true)}</div> : <p className="empty-line">No profile picture yet — the home page shows the TIM timL badge.</p>}
            </div>

            <div className="admin-section">
              <h2>📋 CV</h2>
              <div className="upload-row">
                <input type="file" accept=".pdf,.doc,.docx" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void run(() => upload('cv', f, { title: 'Curriculum Vitae' }), 'CV updated — the “⬇ CV” button now shows on the site.'); e.target.value = ''; }} />
              </div>
              {cv ? <div className="thumb-grid">{card(cv)}</div> : <p className="empty-line">No CV yet. Upload one (PDF is best) and a “⬇ CV” button appears in the menu.</p>}
            </div>

            <div className="admin-section">
              <h2>🖼️ Gallery pictures</h2>
              <div className="upload-row">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={busy}
                  onChange={(e) => { setGalleryFiles([...(e.target.files ?? [])].map((file) => ({ file, title: stem(file.name) }))); }}
                />
              </div>
              {galleryFiles.length > 0 && (
                <>
                  <ul className="picked">
                    {galleryFiles.map((g, idx) => (
                      <li key={idx}>
                        <span>{g.file.name}</span>
                        <input type="text" value={g.title} placeholder="Caption" onChange={(e) => setGalleryFiles((l) => l.map((x, j) => (j === idx ? { ...x, title: e.target.value } : x)))} />
                      </li>
                    ))}
                  </ul>
                  <button type="button" disabled={busy} onClick={uploadGallery}>{busy ? 'Uploading…' : `Upload ${galleryFiles.length} picture${galleryFiles.length === 1 ? '' : 's'}`}</button>
                </>
              )}
              {gallery.length ? <div className="thumb-grid">{gallery.map((g) => card(g, true))}</div> : <p className="empty-line">No pictures yet.</p>}
            </div>

            <div className="admin-section">
              <h2>📜 Certificates &amp; documents</h2>
              <div className="upload-row">
                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*" disabled={busy} onChange={(e) => { const f = e.target.files?.[0] ?? null; setDocFile(f); if (f && !docTitle) setDocTitle(stem(f.name)); }} />
              </div>
              {docFile && (
                <div className="upload-row">
                  <input type="text" value={docTitle} placeholder="Title (e.g. Cisco CCNA)" onChange={(e) => setDocTitle(e.target.value)} />
                  <input type="text" value={docNote} placeholder="Note (e.g. Cisco · 2025)" onChange={(e) => setDocNote(e.target.value)} />
                  <select value={docCategory} onChange={(e) => setDocCategory(e.target.value as 'certificate' | 'other')}>
                    <option value="certificate">Certificate</option>
                    <option value="other">Other document</option>
                  </select>
                  <button type="button" disabled={busy} onClick={uploadDoc}>{busy ? 'Uploading…' : 'Add document'}</button>
                </div>
              )}
              {docs.length ? <div className="thumb-grid">{docs.map((d) => card(d))}</div> : <p className="empty-line">No documents yet.</p>}
            </div>
          </>
        )}
      </div>
    </>
  );
}
