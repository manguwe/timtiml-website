import type { Metadata } from 'next';
import { Section, SectionHeader } from '@/components/site/Section';
import { getSite } from '@/lib/portfolio';
import { STATUS_GROUPS } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Projects & Innovations',
  description: 'Projects by Anotida Manguwe, clearly marked as live, in development, planned or exploring.',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage() {
  const { content } = await getSite();
  return (
    <Section id="projects">
      <SectionHeader label="Projects & Innovations">What I&apos;ve <span>Built</span></SectionHeader>
      <p className="about-text">Each project is labelled honestly: live, in development, planned, or an area I keep exploring.</p>
      {STATUS_GROUPS.map((g) => {
        const projects = content.projects.filter((p) => p.status === g.status);
        if (!projects.length) return null;
        return (
          <div key={g.status} className="project-group">
            <div className="cert-section-title">{g.title}</div>
            <div className="projects-grid">
              {projects.map((p) => (
                <div className="project-card" key={p.id}>
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
                          <a key={l.label + l.href} className={`project-link ${i === 0 && p.status === 'Live' ? 'live' : 'code'}`} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Section>
  );
}
