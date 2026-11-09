'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV_LINKS } from '@/lib/site';

export function Nav({ cvUrl }: { cvUrl?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Sync the toggle button with the theme the inline script already applied.
  useEffect(() => setLight(document.body.classList.contains('light')), []);

  // Close the mobile menu on navigation, and when clicking outside it.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  function toggleTheme() {
    const next = !document.body.classList.contains('light');
    document.body.classList.toggle('light', next);
    setLight(next);
    try {
      localStorage.setItem('timtiml-theme', next ? 'light' : 'dark');
    } catch {
      /* private mode */
    }
  }

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav ref={ref}>
      <Link href="/" aria-label="TIMTIML home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nav-logo-img" src="/img1.png" alt="TIMTIML" />
      </Link>
      <ul className={`nav-links${open ? ' open' : ''}`} id="navLinks">
        {NAV_LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={isActive(l.href) ? 'nav-active' : undefined}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav-tools">
        <button id="theme-toggle" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
          {light ? '☀️' : '🌙'}
        </button>
        {cvUrl && (
          <a id="cv-btn" className="cv-btn" href={cvUrl} target="_blank" rel="noopener noreferrer" title="Download CV">
            ⬇ CV
          </a>
        )}
      </div>
      <button className="hamburger" id="hamburger" aria-label="Menu" aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
        <span /><span /><span />
      </button>
    </nav>
  );
}
