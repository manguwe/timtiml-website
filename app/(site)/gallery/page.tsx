import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/site/GalleryGrid';
import { Section, SectionHeader } from '@/components/site/Section';
import { getSite } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Pictures and designs by Anotida Manguwe.',
  alternates: { canonical: '/gallery' },
};

export default async function GalleryPage() {
  const { portfolio } = await getSite();
  const { gallery } = portfolio;
  return (
    <Section id="gallery">
      <SectionHeader label="Showcase">My <span>Gallery</span></SectionHeader>
      {gallery.length ? (
        <>
          <p className="gallery-lead">Click any picture to view it full size.</p>
          <GalleryGrid items={gallery} />
        </>
      ) : (
        <p className="gallery-lead">Pictures are coming soon — check back shortly. 🖼️</p>
      )}
    </Section>
  );
}
