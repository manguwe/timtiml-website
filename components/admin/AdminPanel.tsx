'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { PortfolioItem } from '@/lib/portfolio';
import type { Post, SiteContent } from '@/lib/site-content';
import { ContentEditor } from './ContentEditor';
import { FilesEditor } from './FilesEditor';
import { JournalEditor } from './JournalEditor';

interface AdminData { items: PortfolioItem[]; posts: Post[]; content: SiteContent; storage: { ok: boolean; message: string } }
const TABS = ['Website text', 'Journal', 'Pictures & documents'] as const;
type Tab = (typeof TABS)[number];

/** The whole "manage my site" screen. Log in, then edit text, post updates, upload pictures and documents — no code. */
export function AdminPanel() {
  const [state, setState] = useState<'loading' | 'out' | 'in'>('loading');
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<Tab>('Website text');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/data');
    if (res.status === 401) return setState('out');
    const d = (await res.json()) as AdminData;
    setData(d);
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
    setError('');
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const d = (await res.json()) as { error?: string };
    if (!res.ok) return setError(d.error ?? 'Login failed.');
    setPassword('');
    await load();
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setData(null);
    setState('out');
  }

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">TIMTIML</Link>
        <div className="admin-nav-label">Manage my site</div>
      </nav>
      <div className="container">
        <div className="admin-top">
          <h1>🗂️ Manage <span>My Site</span></h1>
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
            {error && <p className="admin-hint admin-error">{error}</p>}
            {!configured && <p className="admin-hint admin-error">Not set up yet: add ADMIN_SECRET (8+ characters) in Vercel → Settings → Environment Variables, then redeploy.</p>}
          </div>
        )}

        {state === 'in' && data && (
          <>
            <div className={`banner ${data.storage.ok ? 'good' : 'bad'}`}>
              {data.storage.ok ? '✅ Storage is connected — your changes are saved.' : `⚠️ ${data.storage.message}`}
            </div>
            <div className="tabs">
              {TABS.map((t) => (
                <button key={t} type="button" className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
              ))}
              <Link href="/cv" target="_blank" className="cv-link">📄 View my CV</Link>
            </div>
            {/* All three panels stay mounted (just hidden) so unsaved text isn't lost when you switch tabs. */}
            <div className={tab === 'Website text' ? '' : 'hidden'}>
              <ContentEditor initial={data.content} onSaved={(content) => setData((d) => (d ? { ...d, content } : d))} />
            </div>
            <div className={tab === 'Journal' ? '' : 'hidden'}>
              <JournalEditor posts={data.posts} onChanged={load} />
            </div>
            <div className={tab === 'Pictures & documents' ? '' : 'hidden'}>
              <FilesEditor items={data.items.filter((i) => i.kind !== 'post')} onChanged={load} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
