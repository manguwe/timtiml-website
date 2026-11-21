import type { Metadata } from 'next';
import { PrintButton } from '@/components/site/PrintButton';
import { RichText } from '@/components/site/RichText';
import { getSite } from '@/lib/portfolio';
import { STATUS_GROUPS } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Curriculum Vitae',
  description: 'The CV of Anotida Manguwe — education, skills, projects and contact details.',
  alternates: { canonical: '/cv' },
};

/** The CV is built from the same content as the rest of the site, so editing the site updates the CV. */
export default async function CvPage() {
  const { content, portfolio } = await getSite();
  const { hero, about, education, skillGroups, interests, career, contact } = content;
  const projects = content.projects.filter((p) => p.inCv);
  const certificates = portfolio.certificates;
  const contactLine = [contact.email, contact.phone, contact.location].filter(Boolean);
  const links = [contact.github, contact.linkedin].filter(Boolean);
  return (
    <section id="cv-page">
      <div className="cv-actions">
        <PrintButton />
        <p className="cv-hint">Opens your browser&apos;s print window — choose <strong>Save as PDF</strong> as the printer. Everything on this page comes from the website content, so it is always up to date.</p>
      </div>

      <div className="cv-paper" id="cv-paper">
        <header className="cv-head">
          <h1>Anotida Manguwe</h1>
          <div className="cv-tag">{hero.tag}</div>
          {hero.tagline && <div className="cv-tagline">{hero.tagline}</div>}
          <div className="cv-contact">
            {contactLine.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          {links.length > 0 && (
            <div className="cv-contact">
              {links.map((l) => (
                <span key={l}>{l.replace(/^https?:\/\/(www\.)?/, '')}</span>
              ))}
            </div>
          )}
        </header>

        {about.paragraphs.length > 0 && (
          <div className="cv-section">
            <h2>Profile</h2>
            {about.paragraphs.slice(0, 2).map((p, i) => (
              <p key={i}><RichText text={p} /></p>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div className="cv-section">
            <h2>Education</h2>
            {education.map((e) => (
              <div className="cv-item" key={e.title + e.level}>
                <div className="cv-item-head">
                  <strong>{e.title}</strong>
                  {e.level && <span>{e.level}</span>}
                </div>
                <div className="cv-sub">{e.school}</div>
                {e.areas.length > 0 && <p>Relevant areas: {e.areas.join(', ')}.</p>}
              </div>
            ))}
          </div>
        )}

        {skillGroups.length > 0 && (
          <div className="cv-section">
            <h2>Technical Skills</h2>
            {skillGroups.map((g) => (
              <p key={g.label} className="cv-skill"><strong>{g.label}:</strong> {g.items.join(', ')}</p>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="cv-section">
            <h2>Projects</h2>
            {STATUS_GROUPS.flatMap((g) => projects.filter((p) => p.status === g.status)).map((p) => (
              <div className="cv-item" key={p.id}>
                <div className="cv-item-head">
                  <strong>{p.title}</strong>
                  <span>{p.status}</span>
                </div>
                {p.role && <div className="cv-sub">{p.role}{p.collaborator ? ` — with ${p.collaborator}` : ''}</div>}
                <p>{p.desc}</p>
                {p.links.length > 0 && <p className="cv-links">{p.links.map((l) => l.href.replace(/^https?:\/\/(www\.)?/, '')).join(' · ')}</p>}
              </div>
            ))}
          </div>
        )}

        {certificates.length > 0 && (
          <div className="cv-section">
            <h2>Certificates</h2>
            <ul className="cv-list">
              {certificates.map((c) => (
                <li key={c.id}>{c.title}{c.note ? ` — ${c.note}` : ''}</li>
              ))}
            </ul>
          </div>
        )}

        {interests.length > 0 && (
          <div className="cv-section">
            <h2>Professional Interests</h2>
            <p>{interests.join(' · ')}</p>
          </div>
        )}

        {career.objective && (
          <div className="cv-section">
            <h2>Career Objective</h2>
            <p>{career.objective}</p>
          </div>
        )}
      </div>
    </section>
  );
}
