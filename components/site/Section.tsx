'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** A page section that fades in when it scrolls into view (replaces the old global IntersectionObserver). */
export function Section({ id, className, style, children }: { id?: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return el.classList.add('visible');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('visible'), io.unobserve(e.target))),
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} id={id} className={`fade-in${className ? ' ' + className : ''}`} style={style}>
      {children}
    </section>
  );
}

export function SectionHeader({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <div className="section-label">{label}</div>
      <h2>{children}</h2>
      <div className="divider" />
    </>
  );
}
