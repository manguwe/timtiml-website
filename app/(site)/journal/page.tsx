import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/site/GalleryGrid';
import { RichText, formatDate } from '@/components/site/RichText';
import { Section, SectionHeader } from '@/components/site/Section';
import { getSite } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Updates, activities and memories from Anotida Manguwe.',
  alternates: { canonical: '/journal' },
};

export default async function JournalPage() {
  const { posts } = await getSite();
  return (
    <Section id="journal">
      <SectionHeader label="Journal">Updates &amp; <span>Memories</span></SectionHeader>
      {posts.length === 0 ? (
        <p className="gallery-lead">Updates are coming soon — check back shortly. 📓</p>
      ) : (
        <div className="journal-list">
          {posts.map((p) => (
            <article className="journal-card" key={p.id} id={`post-${p.id}`}>
              <div className="journal-date">{formatDate(p.date)}</div>
              <h3>{p.title}</h3>
              {p.body && <p className="journal-body"><RichText text={p.body} /></p>}
              {p.images.length > 0 && <GalleryGrid items={p.images.map((u, i) => ({ id: `${p.id}-${i}`, title: p.title, note: formatDate(p.date), url: u }))} />}
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
