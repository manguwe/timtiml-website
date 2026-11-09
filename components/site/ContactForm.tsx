'use client';

import { useState, type FormEvent } from 'react';
import { SITE, wa } from '@/lib/site';

type Status = 'idle' | 'sending' | 'sent';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError('');
    setStatus('sending');
    try {
      const res = await fetch(SITE.formspree, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || 'Something went wrong. Please try WhatsApp instead.');
      }
      form.reset();
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed. Please try WhatsApp.');
      setStatus('idle');
    }
  }

  return (
    <div className="contact-form-card">
      <div className="contact-form-title">✉️ Send a Message</div>
      <div className="contact-form-sub">Fill in the form — Anotida will reply to your email.</div>

      {status === 'sent' ? (
        <div className="cf-success">
          <div className="cf-success-icon">✅</div>
          <strong>Message Sent!</strong>
          <p>Thanks for reaching out. Anotida will reply to your email shortly.</p>
          <button type="button" onClick={() => setStatus('idle')}>Send another message</button>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="cf-field">
            <label className="cf-label" htmlFor="cf-name">Full Name</label>
            <input className="cf-input" id="cf-name" name="name" type="text" placeholder="Your name" required />
          </div>
          <div className="cf-field">
            <label className="cf-label" htmlFor="cf-email">Email Address</label>
            <input className="cf-input" id="cf-email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="cf-field">
            <label className="cf-label" htmlFor="cf-subject">Subject</label>
            <select className="cf-input cf-select" id="cf-subject" name="subject" defaultValue="General">
              <option value="General">💬 Just saying hello</option>
              <option value="Work">🤝 Work / Collaboration</option>
              <option value="Question">❓ A question</option>
              <option value="Feedback">⭐ Feedback</option>
            </select>
          </div>
          <div className="cf-field">
            <label className="cf-label" htmlFor="cf-message">Message</label>
            <textarea className="cf-input" id="cf-message" name="message" rows={4} placeholder="Tell me what you need..." required />
          </div>
          {error && <div className="cf-error" style={{ display: 'block' }}>⚠️ {error}</div>}
          <button className="cf-submit-btn" type="submit" disabled={status === 'sending'}>
            <span>{status === 'sending' ? 'Sending…' : 'Send Message →'}</span>
          </button>
          <p className="cf-foot">
            Prefer instant reply?{' '}
            <a href={wa()} target="_blank" rel="noopener noreferrer">WhatsApp Anotida directly →</a>
          </p>
        </form>
      )}
    </div>
  );
}
