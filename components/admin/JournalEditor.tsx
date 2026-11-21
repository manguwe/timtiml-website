'use client';

import { useState } from 'react';
import type { Post } from '@/lib/site-content';
import { Field } from './fields';
import { uploadFile } from './uploadFile';

const today = () => new Date().toISOString().slice(0, 10);

/** Write journal updates ("what I did today") with pictures. They show on the Journal page. */
export function JournalEditor({ posts, onChanged }: { posts: Post[]; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today());
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function reset() {
    setEditing(null);
    setTitle('');
    setDate(today());
    setBody('');
    setImages([]);
    setNewFiles([]);
  }

  function load(p: Post) {
    setEditing(p.id);
    setTitle(p.title);
    setDate(p.date);
    setBody(p.body);
    setImages(p.images);
    setNewFiles([]);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function publish() {
    setBusy(true);
    setMsg(null);
    try {
      if (!title.trim()) throw new Error('Please give the post a title.');
      const urls = [...images];
      for (const f of newFiles) urls.push((await uploadFile('post', f)).url);
      const res = await fetch('/api/admin/post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing ?? undefined, title, date, body, images: urls }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Could not save the post.');
      await onChanged();
      reset();
      setMsg({ ok: true, text: editing ? 'Post updated.' : 'Post published — it is on the Journal page now.' });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Post) {
    if (!confirm(`Delete “${p.title}” and its pictures?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/post?id=${encodeURIComponent(p.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete.');
      if (editing === p.id) reset();
      await onChanged();
      setMsg({ ok: true, text: 'Deleted.' });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not delete.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-section">
      <h2>📓 Journal</h2>
      <p className="admin-lead">Share what you&apos;re up to — a trip, an event, a milestone. Add pictures if you like. Posts appear on the <strong>Journal</strong> page, newest first.</p>

      <div className="edit-card">
        <div className="edit-card-head"><strong>{editing ? '✏️ Editing a post' : '➕ New post'}</strong>{editing && <button type="button" className="mini ghost" onClick={reset}>Cancel edit</button>}</div>
        <div className="grid2">
          <Field label="Title" value={title} onChange={setTitle} placeholder="e.g. Hackathon at Eden University" />
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <Field label="What happened" multiline value={body} onChange={setBody} hint="Use **double stars** for bold." />
        {images.length > 0 && (
          <div className="field">
            <label>Pictures on this post</label>
            <div className="post-thumbs">
              {images.map((u) => (
                <div className="post-thumb" key={u}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" />
                  <button type="button" className="danger" onClick={() => setImages(images.filter((x) => x !== u))}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="field">
          <label>Add pictures</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setNewFiles([...(e.target.files ?? [])])} />
          {newFiles.length > 0 && <small>{newFiles.length} picture{newFiles.length === 1 ? '' : 's'} will upload when you publish.</small>}
        </div>
        <button type="button" disabled={busy} onClick={publish}>{busy ? 'Saving…' : editing ? 'Save post' : 'Publish post'}</button>
        {msg && <p className={`admin-hint ${msg.ok ? 'admin-ok' : 'admin-error'}`}>{msg.ok ? '✅ ' : '❌ '}{msg.text}</p>}
      </div>

      {posts.length === 0 && <p className="empty-line">No posts yet.</p>}
      {[...posts].sort((a, b) => b.date.localeCompare(a.date)).map((p) => (
        <div className="edit-card" key={p.id}>
          <div className="edit-card-head">
            <strong>{p.title} <span className="admin-hint">· {p.date}</span></strong>
            <div className="row-actions">
              <button type="button" className="mini ghost" onClick={() => load(p)}>Edit</button>
              <button type="button" className="mini danger" disabled={busy} onClick={() => remove(p)}>Delete</button>
            </div>
          </div>
          {p.body && <p className="admin-hint">{p.body.slice(0, 160)}{p.body.length > 160 ? '…' : ''}</p>}
          {p.images.length > 0 && <p className="admin-hint">📷 {p.images.length} picture{p.images.length === 1 ? '' : 's'}</p>}
        </div>
      ))}
    </div>
  );
}
