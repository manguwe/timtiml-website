import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, SectionHeader } from '@/components/site/Section';
import { content } from '@/lib/content';
import { getPortfolio } from '@/lib/portfolio';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function HomePage() {
  const { hero, glance, quickAccess } = content;
  const { profile, certificates } = await getPortfolio();
  return (
    <>
      <section id="home">
        <div className="hero-inner">
          <div>
            <div className="hero-tag">{hero.tag}</div>
            <div className="hero-name">
              Anotida
              <br />
              <em>Manguwe</em>
            </div>
            <p className="hero-tagline">{hero.tagline}</p>
            <p className="hero-sub">{hero.sub}</p>
            <Link className="btn btn-primary" href="/projects">View Projects</Link>
            <Link className="btn btn-outline" href="/contact">Get in Touch</Link>
            <div className="hero-links">
              <a className="social-btn" href={SITE.links.github} target="_blank" rel="noopener noreferrer">🐙 GitHub</a>
              <a className="social-btn" href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>
            </div>
          </div>
          <div className={`hero-badge${profile ? ' has-photo' : ''}`}>
            {profile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.url} alt={SITE.owner} />
            ) : (
              <div className="hero-badge-inner">
                TIM
                <br />
                timL
              </div>
            )}
          </div>
        </div>
      </section>

      <Section id="glance">
        <SectionHeader label="At a Glance">Who I <span>Am</span></SectionHeader>
        <div className="history-grid">
          {glance.map((g) => (
            <div className="history-card" key={g.title}>
              <div className="history-card-year">{g.year}</div>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
            </div>
          ))}
        </div>
        <p className="home-more"><Link href="/about">Read more about me →</Link></p>
        {certificates.length > 0 && (
          <>
            <div className="cert-section-title">📜 Certificates &amp; Credentials</div>
            <div className="cert-cards-grid">
              {certificates.slice(0, 6).map((c) => (
                <div className="cert-card" key={c.id}>
                  <div className="cert-card-icon">{c.contentType.startsWith('image/') ? '🖼️' : '📕'}</div>
                  <div className="cert-card-title">{c.title}</div>
                  {c.note && <div className="cert-card-issuer">{c.note}</div>}
                  <a className="cert-open-btn" href={c.url} target="_blank" rel="noopener noreferrer">Open ↗</a>
                </div>
              ))}
            </div>
            <p className="home-more"><Link href="/documents">See all documents →</Link></p>
          </>
        )}
      </Section>

      <section className="qa-section">
        <div className="qa-head">
          <div className="qa-eyebrow">Explore More</div>
          <p className="qa-lead">Where would you like to go next?</p>
        </div>
        <div className="qa-grid">
          {quickAccess.map((q) => (
            <Link key={q.href} href={q.href} className="qa-btn">
              {q.icon}
              <br />
              <strong>{q.title}</strong>
              <br />
              <span>{q.sub}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
