'use client';

import { useState } from 'react';
import type { PortfolioItem } from '@/lib/portfolio';
import { Field } from './fields';
import { uploadFile } from './uploadFile';

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);
const stem = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();

/** Profile picture, gallery pictures, and certificates / other documents. */
export function FilesEditor({ items, onChanged }: { items: PortfolioItem[]; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<{ file: File; title: string }[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docNote, setDocNote] = useState('');
  const [docCategory, setDocCategory] = useState<'certificate' | 'other'>('certificate');
  const [editing, setEditing] = useState<{ id: string; title: string; note: string } | null>(null);

  async function run(job: () => Promise<void>, done: string) {
    setBusy(true);
    setMsg(null);
    try {
      await job();
      await onChanged();
      setMsg({ ok: true, text: done });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  }

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
      {msg && <p className={`admin-hint ${msg.ok ? 'admin-ok' : 'admin-error'}`}>{msg.ok ? '✅ ' : '❌ '}{msg.text}</p>}

      <div className="admin-section">
        <h2>🙂 Profile picture</h2>
        <div className="upload-row">
          <input type="file" accept="image/*" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void run(async () => void (await uploadFile('profile', f)), 'Profile picture updated.'); e.target.value = ''; }} />
        </div>
        {profile ? <div className="thumb-grid">{card(profile, true)}</div> : <p className="empty-line">No profile picture yet — the home page shows the TIM timL badge.</p>}
      </div>

      <div className="admin-section">
        <h2>🖼️ Gallery pictures</h2>
        <div className="upload-row">
          <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => setGalleryFiles([...(e.target.files ?? [])].map((file) => ({ file, title: stem(file.name) })))} />
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
            <button type="button" disabled={busy} onClick={() => run(async () => { for (const g of galleryFiles) await uploadFile('gallery', g.file, { title: g.title }); setGalleryFiles([]); }, `Added ${galleryFiles.length} picture${galleryFiles.length === 1 ? '' : 's'} to the gallery.`)}>
              {busy ? 'Uploading…' : `Upload ${galleryFiles.length} picture${galleryFiles.length === 1 ? '' : 's'}`}
            </button>
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
            <button type="button" disabled={busy} onClick={() => run(async () => { await uploadFile('document', docFile, { title: docTitle || stem(docFile.name), note: docNote, category: docCategory }); setDocFile(null); setDocTitle(''); setDocNote(''); }, 'Document added.')}>{busy ? 'Uploading…' : 'Add document'}</button>
          </div>
        )}
        {docs.length ? <div className="thumb-grid">{docs.map((d) => card(d))}</div> : <p className="empty-line">No documents yet.</p>}
      </div>
    </>
  );
}
