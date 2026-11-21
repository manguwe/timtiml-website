import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, SectionHeader } from '@/components/site/Section';
import { getSite, type PortfolioItem } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'Documents',
  description: 'Certificates and other documents of Anotida Manguwe.',
  alternates: { canonical: '/documents' },
};

const iconFor = (i: PortfolioItem) => (i.contentType.startsWith('image/') ? '🖼️' : i.contentType === 'application/pdf' ? '📕' : '📄');

function Cards({ items }: { items: PortfolioItem[] }) {
  return (
    <div className="cert-cards-grid">
      {items.map((d) => (
        <div className="cert-card" key={d.id}>
          <div className="cert-card-icon">{iconFor(d)}</div>
          <div className="cert-card-title">{d.title}</div>
          {d.note && <div className="cert-card-issuer">{d.note}</div>}
          <a className="cert-open-btn" href={d.url} target="_blank" rel="noopener noreferrer">Open ↗</a>
        </div>
      ))}
    </div>
  );
}

export default async function DocumentsPage() {
  const { portfolio } = await getSite();
  const { certificates, documents } = portfolio;
  const nothing = !certificates.length && !documents.length;
  return (
    <Section id="documents">
      <SectionHeader label="Papers">Certificates &amp; <span>Documents</span></SectionHeader>
      <p className="gallery-lead">Looking for my CV? <Link href="/cv">View and export it as a PDF →</Link></p>
      {nothing && <p className="gallery-lead">Documents are coming soon — check back shortly. 📄</p>}
      {certificates.length > 0 && (
        <>
          <div className="cert-section-title">📜 Certificates &amp; Credentials</div>
          <Cards items={certificates} />
        </>
      )}
      {documents.length > 0 && (
        <>
          <div className="cert-section-title">📁 Other Documents</div>
          <Cards items={documents} />
        </>
      )}
    </Section>
  );
}
