import type { Metadata } from 'next';
import Link from 'next/link';
import { RichText, formatDate } from '@/components/site/RichText';
import { Section, SectionHeader } from '@/components/site/Section';
import { getSite } from '@/lib/portfolio';
import { wa } from '@/lib/site';

export const metadata: Metadata = { alternates: { canonical: '/' } };

const QUICK = [
  { icon: '👤', title: 'About Me', sub: 'Background, education & skills', href: '/about' },
  { icon: '🚀', title: 'Projects', sub: "What I've built and I'm building", href: '/projects' },
  { icon: '📓', title: 'Journal', sub: 'Updates and memories', href: '/journal' },
  { icon: '📄', title: 'My CV', sub: 'View and export as PDF', href: '/cv' },
  { icon: '💬', title: 'Contact', sub: 'Get in touch', href: '/contact' },
];

export default async function HomePage() {
  const { content, posts, portfolio } = await getSite();
  const { hero, glance, offers, contact } = content;
  const { profile, certificates } = portfolio;
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
              {contact.github && <a className="social-btn" href={contact.github} target="_blank" rel="noopener noreferrer">🐙 GitHub</a>}
              {contact.linkedin && <a className="social-btn" href={contact.linkedin} target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>}
              <Link className="social-btn" href="/cv">📄 Export my CV</Link>
            </div>
          </div>
          <div className={`hero-badge${profile ? ' has-photo' : ''}`}>
            {profile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.url} alt="Anotida Manguwe" />
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

      {glance.length > 0 && (
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
        </Section>
      )}

      {offers.items.length > 0 && (
        <Section id="offer">
          <SectionHeader label="Services">What I <span>Offer</span></SectionHeader>
          {offers.intro && <p className="about-text">{offers.intro}</p>}
          <div className="gd-cards">
            {offers.items.map((o) => (
              <div className="gd-card" key={o.title}>
                <div className="gd-card-icon">{o.icon}</div>
                <h4>{o.title}</h4>
                <p>{o.text}</p>
              </div>
            ))}
          </div>
          <p className="home-more">
            <Link href="/contact">Let&apos;s talk about your idea →</Link>
            {contact.whatsapp && <> · <a href={wa('Hi Anotida! I saw your website and I would like to talk.', contact.whatsapp)} target="_blank" rel="noopener noreferrer">Message me on WhatsApp</a></>}
          </p>
        </Section>
      )}

      {posts.length > 0 && (
        <Section id="latest">
          <SectionHeader label="Journal">Latest <span>Updates</span></SectionHeader>
          <div className="journal-list">
            {posts.slice(0, 3).map((p) => (
              <article className="journal-card" key={p.id}>
                <div className="journal-date">{formatDate(p.date)}</div>
                <h3>{p.title}</h3>
                {p.body && <p className="journal-body"><RichText text={p.body.length > 220 ? `${p.body.slice(0, 220)}…` : p.body} /></p>}
              </article>
            ))}
          </div>
          <p className="home-more"><Link href="/journal">See all updates →</Link></p>
        </Section>
      )}

      {certificates.length > 0 && (
        <Section id="certs">
          <SectionHeader label="Credentials">Certificates &amp; <span>Credentials</span></SectionHeader>
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
        </Section>
      )}

      <section className="qa-section">
        <div className="qa-head">
          <div className="qa-eyebrow">Explore More</div>
          <p className="qa-lead">Where would you like to go next?</p>
        </div>
        <div className="qa-grid">
          {QUICK.map((q) => (
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
