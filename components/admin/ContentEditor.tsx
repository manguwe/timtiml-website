'use client';

import { useState } from 'react';
import { STATUSES, type SiteContent } from '@/lib/site-content';
import { Card, Field, StringList, move, removeAt, setAt } from './fields';

const TABS = ['Home', 'About', 'Education & Skills', 'What I Offer', 'Projects', 'Contact'] as const;
type Tab = (typeof TABS)[number];

/** Edits every piece of text on the public site. Nothing is live until you press "Save changes". */
export function ContentEditor({ initial, onSaved }: { initial: SiteContent; onSaved: (c: SiteContent) => void }) {
  const [c, setC] = useState<SiteContent>(initial);
  const [tab, setTab] = useState<Tab>('Home');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const edit = (next: SiteContent) => {
    setC(next);
    setDirty(true);
    setMsg(null);
  };

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: c }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string; content?: SiteContent };
      if (!res.ok || !data.content) throw new Error(data.error ?? 'Could not save.');
      setC(data.content);
      onSaved(data.content);
      setDirty(false);
      setMsg({ ok: true, text: 'Saved — the website is updated.' });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not save.' });
    } finally {
      setBusy(false);
    }
  }

  const blankProject = () => ({ id: `project-${Date.now()}`, icon: '🚀', status: 'In development' as const, title: 'New project', desc: '', role: '', collaborator: '', features: [], meta: [], links: [], inCv: true });

  return (
    <div className="admin-section">
      <h2>✏️ Website text</h2>
      <p className="admin-lead">Change anything visitors read on your site, then press <strong>Save changes</strong>. Your CV page updates automatically too.</p>
      <div className="tabs subtabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Home' && (
        <>
          <Field label="Line above your name" value={c.hero.tag} onChange={(v) => edit({ ...c, hero: { ...c.hero, tag: v } })} />
          <Field label="Tagline" value={c.hero.tagline} onChange={(v) => edit({ ...c, hero: { ...c.hero, tagline: v } })} />
          <Field label="Short intro" multiline value={c.hero.sub} onChange={(v) => edit({ ...c, hero: { ...c.hero, sub: v } })} />
          <h3 className="admin-sub">“Who I am” cards</h3>
          {c.glance.map((g, i) => (
            <Card key={i} title={g.title || 'Card'} onRemove={() => edit({ ...c, glance: removeAt(c.glance, i) })}>
              <div className="grid2">
                <Field label="Small label" value={g.year} onChange={(v) => edit({ ...c, glance: setAt(c.glance, i, { ...g, year: v }) })} />
                <Field label="Title" value={g.title} onChange={(v) => edit({ ...c, glance: setAt(c.glance, i, { ...g, title: v }) })} />
              </div>
              <Field label="Text" multiline value={g.text} onChange={(v) => edit({ ...c, glance: setAt(c.glance, i, { ...g, text: v }) })} />
            </Card>
          ))}
          {c.glance.length < 6 && <button type="button" className="mini ghost" onClick={() => edit({ ...c, glance: [...c.glance, { year: '', title: 'New card', text: '' }] })}>+ Add card</button>}
        </>
      )}

      {tab === 'About' && (
        <>
          <StringList label="About paragraphs" multiline items={c.about.paragraphs} onChange={(v) => edit({ ...c, about: { ...c.about, paragraphs: v } })} addLabel="+ Add paragraph" hint="The first paragraph is highlighted. Use **double stars** to make a word bold." />
          <Field label="Motto" value={c.about.motto} onChange={(v) => edit({ ...c, about: { ...c.about, motto: v } })} />
          <Field label="How I think about technology" multiline value={c.about.philosophy} onChange={(v) => edit({ ...c, about: { ...c.about, philosophy: v } })} />
          <StringList label="How I work (short tags)" items={c.about.approach} onChange={(v) => edit({ ...c, about: { ...c.about, approach: v } })} />
          <StringList label="Professional interests" items={c.interests} onChange={(v) => edit({ ...c, interests: v })} />
          <Field label="Career direction" multiline value={c.career.text} onChange={(v) => edit({ ...c, career: { ...c.career, text: v } })} />
          <Field label="Career objective" multiline value={c.career.objective} onChange={(v) => edit({ ...c, career: { ...c.career, objective: v } })} />
        </>
      )}

      {tab === 'Education & Skills' && (
        <>
          <h3 className="admin-sub">Education</h3>
          {c.education.map((e, i) => (
            <Card key={i} title={e.title || 'Education'} onRemove={() => edit({ ...c, education: removeAt(c.education, i) })}>
              <div className="grid2">
                <Field label="Level / year (e.g. Level 2.2)" value={e.level} onChange={(v) => edit({ ...c, education: setAt(c.education, i, { ...e, level: v }) })} />
                <Field label="School" value={e.school} onChange={(v) => edit({ ...c, education: setAt(c.education, i, { ...e, school: v }) })} />
              </div>
              <Field label="Qualification" value={e.title} onChange={(v) => edit({ ...c, education: setAt(c.education, i, { ...e, title: v }) })} />
              <StringList label="Relevant areas" items={e.areas} onChange={(v) => edit({ ...c, education: setAt(c.education, i, { ...e, areas: v }) })} />
            </Card>
          ))}
          <button type="button" className="mini ghost" onClick={() => edit({ ...c, education: [...c.education, { level: '', title: 'New qualification', school: '', areas: [] }] })}>+ Add education</button>
          <h3 className="admin-sub">Skills</h3>
          {c.skillGroups.map((g, i) => (
            <Card key={i} title={g.label || 'Skill group'} onRemove={() => edit({ ...c, skillGroups: removeAt(c.skillGroups, i) })} onUp={() => edit({ ...c, skillGroups: move(c.skillGroups, i, -1) })} onDown={() => edit({ ...c, skillGroups: move(c.skillGroups, i, 1) })}>
              <Field label="Group name" value={g.label} onChange={(v) => edit({ ...c, skillGroups: setAt(c.skillGroups, i, { ...g, label: v }) })} />
              <StringList label="Skills" items={g.items} onChange={(v) => edit({ ...c, skillGroups: setAt(c.skillGroups, i, { ...g, items: v }) })} addLabel="+ Add skill" />
            </Card>
          ))}
          <button type="button" className="mini ghost" onClick={() => edit({ ...c, skillGroups: [...c.skillGroups, { label: 'New group', items: [] }] })}>+ Add skill group</button>
        </>
      )}

      {tab === 'What I Offer' && (
        <>
          <Field label="Intro sentence" multiline value={c.offers.intro} onChange={(v) => edit({ ...c, offers: { ...c.offers, intro: v } })} />
          {c.offers.items.map((o, i) => (
            <Card key={i} title={o.title || 'Offer'} onRemove={() => edit({ ...c, offers: { ...c.offers, items: removeAt(c.offers.items, i) } })} onUp={() => edit({ ...c, offers: { ...c.offers, items: move(c.offers.items, i, -1) } })} onDown={() => edit({ ...c, offers: { ...c.offers, items: move(c.offers.items, i, 1) } })}>
              <div className="grid2">
                <Field label="Icon (an emoji)" value={o.icon} onChange={(v) => edit({ ...c, offers: { ...c.offers, items: setAt(c.offers.items, i, { ...o, icon: v }) } })} />
                <Field label="Title" value={o.title} onChange={(v) => edit({ ...c, offers: { ...c.offers, items: setAt(c.offers.items, i, { ...o, title: v }) } })} />
              </div>
              <Field label="Description" multiline value={o.text} onChange={(v) => edit({ ...c, offers: { ...c.offers, items: setAt(c.offers.items, i, { ...o, text: v }) } })} />
            </Card>
          ))}
          <button type="button" className="mini ghost" onClick={() => edit({ ...c, offers: { ...c.offers, items: [...c.offers.items, { icon: '✨', title: 'New service', text: '' }] } })}>+ Add something I offer</button>
        </>
      )}

      {tab === 'Projects' && (
        <>
          <p className="admin-hint">Change a project&apos;s <strong>Status</strong> (for example from “In development” to “Live”) and it moves to the right section automatically.</p>
          {c.projects.map((p, i) => (
            <Card key={p.id} title={`${p.icon} ${p.title}`} onRemove={() => confirm(`Delete “${p.title}”?`) && edit({ ...c, projects: removeAt(c.projects, i) })} onUp={() => edit({ ...c, projects: move(c.projects, i, -1) })} onDown={() => edit({ ...c, projects: move(c.projects, i, 1) })}>
              <div className="grid2">
                <Field label="Title" value={p.title} onChange={(v) => edit({ ...c, projects: setAt(c.projects, i, { ...p, title: v }) })} />
                <div className="field">
                  <label>Status</label>
                  <select value={p.status} onChange={(e) => edit({ ...c, projects: setAt(c.projects, i, { ...p, status: e.target.value as typeof p.status }) })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <Field label="Icon (an emoji)" value={p.icon} onChange={(v) => edit({ ...c, projects: setAt(c.projects, i, { ...p, icon: v }) })} />
                <Field label="Your role" value={p.role} onChange={(v) => edit({ ...c, projects: setAt(c.projects, i, { ...p, role: v }) })} />
              </div>
              <Field label="Worked with (optional)" value={p.collaborator} onChange={(v) => edit({ ...c, projects: setAt(c.projects, i, { ...p, collaborator: v }) })} />
              <Field label="Description" multiline value={p.desc} onChange={(v) => edit({ ...c, projects: setAt(c.projects, i, { ...p, desc: v }) })} />
              <StringList label="Key features" items={p.features} onChange={(v) => edit({ ...c, projects: setAt(c.projects, i, { ...p, features: v }) })} addLabel="+ Add feature" />
              <StringList label="Technology / labels" items={p.meta} onChange={(v) => edit({ ...c, projects: setAt(c.projects, i, { ...p, meta: v }) })} addLabel="+ Add label" />
              <div className="field">
                <label>Links</label>
                {p.links.map((l, k) => (
                  <div className="list-row" key={k}>
                    <input type="text" placeholder="Button text" value={l.label} onChange={(e) => edit({ ...c, projects: setAt(c.projects, i, { ...p, links: setAt(p.links, k, { ...l, label: e.target.value }) }) })} />
                    <input type="text" placeholder="https://…" value={l.href} onChange={(e) => edit({ ...c, projects: setAt(c.projects, i, { ...p, links: setAt(p.links, k, { ...l, href: e.target.value }) }) })} />
                    <button type="button" className="mini danger" onClick={() => edit({ ...c, projects: setAt(c.projects, i, { ...p, links: removeAt(p.links, k) }) })}>✕</button>
                  </div>
                ))}
                <div><button type="button" className="mini ghost" onClick={() => edit({ ...c, projects: setAt(c.projects, i, { ...p, links: [...p.links, { label: 'Link', href: '' }] }) })}>+ Add link</button></div>
              </div>
              <label className="check"><input type="checkbox" checked={p.inCv} onChange={(e) => edit({ ...c, projects: setAt(c.projects, i, { ...p, inCv: e.target.checked }) })} /> Include in my CV</label>
            </Card>
          ))}
          <button type="button" className="mini ghost" onClick={() => edit({ ...c, projects: [...c.projects, blankProject()] })}>+ Add project</button>
        </>
      )}

      {tab === 'Contact' && (
        <>
          <div className="grid2">
            <Field label="Email" value={c.contact.email} onChange={(v) => edit({ ...c, contact: { ...c.contact, email: v } })} />
            <Field label="Phone (as shown)" value={c.contact.phone} onChange={(v) => edit({ ...c, contact: { ...c.contact, phone: v } })} />
            <Field label="WhatsApp number (digits only, with country code)" value={c.contact.whatsapp} onChange={(v) => edit({ ...c, contact: { ...c.contact, whatsapp: v } })} />
            <Field label="Location" value={c.contact.location} onChange={(v) => edit({ ...c, contact: { ...c.contact, location: v } })} />
            <Field label="GitHub link" value={c.contact.github} onChange={(v) => edit({ ...c, contact: { ...c.contact, github: v } })} />
            <Field label="LinkedIn link" value={c.contact.linkedin} onChange={(v) => edit({ ...c, contact: { ...c.contact, linkedin: v } })} />
            <Field label="Telegram link" value={c.contact.telegram} onChange={(v) => edit({ ...c, contact: { ...c.contact, telegram: v } })} />
            <Field label="Instagram link" value={c.contact.instagram} onChange={(v) => edit({ ...c, contact: { ...c.contact, instagram: v } })} />
            <Field label="Facebook link" value={c.contact.facebook} onChange={(v) => edit({ ...c, contact: { ...c.contact, facebook: v } })} />
            <Field label="Threads link" value={c.contact.threads} onChange={(v) => edit({ ...c, contact: { ...c.contact, threads: v } })} />
            <Field label="WhatsApp channel link" value={c.contact.whatsappChannel} onChange={(v) => edit({ ...c, contact: { ...c.contact, whatsappChannel: v } })} />
          </div>
          <p className="admin-hint">Leave a box empty to hide that link from the site.</p>
        </>
      )}

      <div className="save-bar">
        <button type="button" disabled={busy || !dirty} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button>
        {dirty && !msg && <span className="admin-hint">You have unsaved changes.</span>}
        {msg && <span className={`admin-hint ${msg.ok ? 'admin-ok' : 'admin-error'}`}>{msg.ok ? '✅ ' : '❌ '}{msg.text}</span>}
      </div>
    </div>
  );
}
