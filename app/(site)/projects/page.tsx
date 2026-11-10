import type { Metadata } from 'next';
import { Section, SectionHeader } from '@/components/site/Section';
import { content } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Projects & Innovations',
  description: 'Projects by Anotida Manguwe: Campus Crib (live), Student Hub, a retail point-of-sale system, AgriMobi AI and more — clearly marked as live, in development or planned.',
  alternates: { canonical: '/projects' },
};

export default function ProjectsPage() {
  return (
    <Section id="projects">
      <SectionHeader label="Projects & Innovations">What I&apos;ve <span>Built</span></SectionHeader>
      <p className="about-text">Each project is labelled honestly: live, in development, planned, or an area I keep exploring.</p>
      {content.projectGroups.map((g) => (
        <div key={g.id} className="project-group">
          <div className="cert-section-title">{g.title}</div>
          <div className="projects-grid">
            {g.projects.map((p) => (
              <div className="project-card" key={p.title}>
                <div className="project-thumb">
                  {p.icon}
                  <div className="project-tag">{p.status}</div>
                </div>
                <div className="project-body">
                  <div className="project-title">{p.title}</div>
                  {p.role && <div className="project-role">Role: {p.role}{p.collaborator ? ` · with ${p.collaborator}` : ''}</div>}
                  <div className="project-desc">{p.desc}</div>
                  {p.features.length > 0 && (
                    <ul className="project-features">
                      {p.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  )}
                  {p.meta.length > 0 && (
                    <div className="project-meta">
                      {p.meta.map((m) => (
                        <span className="cert-tag" key={m}>{m}</span>
                      ))}
                    </div>
                  )}
                  {p.links.length > 0 && (
                    <div className="project-links">
                      {p.links.map((l, i) => (
                        <a key={l.label} className={`project-link ${i === 0 && l.label.includes('Live') ? 'live' : 'code'}`} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Section>
  );
}
