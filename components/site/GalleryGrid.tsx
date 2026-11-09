'use client';

import { useEffect, useState } from 'react';

export interface GalleryImage { id: string; title: string; note: string; url: string }

/** Thumbnail grid with a click-to-enlarge lightbox (Esc or click to close). */
export function GalleryGrid({ items }: { items: GalleryImage[] }) {
  const [open, setOpen] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <div className="gallery-grid">
        {items.map((it) => (
          <button key={it.id} type="button" className="gallery-item gallery-thumb" title={it.note ? `${it.title} — ${it.note}` : it.title} onClick={() => setOpen(it)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.url} alt={it.title} loading="lazy" />
            <div className="gallery-thumb-caption">{it.title}</div>
          </button>
        ))}
      </div>
      {open && (
        <div className="gallery-lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open.url} alt={open.title} />
          <div className="gallery-lightbox-title">{open.title}</div>
          {open.note && <div className="gallery-lightbox-hint">{open.note}</div>}
          <div className="gallery-lightbox-hint">Click anywhere to close</div>
        </div>
      )}
    </>
  );
}
