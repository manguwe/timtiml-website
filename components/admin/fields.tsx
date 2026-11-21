'use client';

import type { ReactNode } from 'react';

export const setAt = <T,>(a: T[], i: number, v: T): T[] => a.map((x, j) => (j === i ? v : x));
export const removeAt = <T,>(a: T[], i: number): T[] => a.filter((_, j) => j !== i);
export const move = <T,>(a: T[], i: number, d: -1 | 1): T[] => {
  const j = i + d;
  if (j < 0 || j >= a.length) return a;
  const c = [...a];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
};

export function Field({ label, value, onChange, hint, multiline, placeholder }: { label: string; value: string; onChange: (v: string) => void; hint?: string; multiline?: boolean; placeholder?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      {multiline ? <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /> : <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
      {hint && <small>{hint}</small>}
    </div>
  );
}

/** A list of short texts (skills, interests, features…) with add / remove. */
export function StringList({ label, items, onChange, multiline, addLabel = '+ Add', hint }: { label: string; items: string[]; onChange: (v: string[]) => void; multiline?: boolean; addLabel?: string; hint?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      {items.map((it, i) => (
        <div className="list-row" key={i}>
          {multiline ? <textarea value={it} onChange={(e) => onChange(setAt(items, i, e.target.value))} /> : <input type="text" value={it} onChange={(e) => onChange(setAt(items, i, e.target.value))} />}
          <button type="button" className="mini danger" onClick={() => onChange(removeAt(items, i))} aria-label="Remove">✕</button>
        </div>
      ))}
      <div><button type="button" className="mini ghost" onClick={() => onChange([...items, ''])}>{addLabel}</button></div>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Card({ title, onRemove, onUp, onDown, children }: { title: string; onRemove?: () => void; onUp?: () => void; onDown?: () => void; children: ReactNode }) {
  return (
    <div className="edit-card">
      <div className="edit-card-head">
        <strong>{title}</strong>
        <div className="row-actions">
          {onUp && <button type="button" className="mini ghost" onClick={onUp} aria-label="Move up">↑</button>}
          {onDown && <button type="button" className="mini ghost" onClick={onDown} aria-label="Move down">↓</button>}
          {onRemove && <button type="button" className="mini danger" onClick={onRemove}>Delete</button>}
        </div>
      </div>
      {children}
    </div>
  );
}
