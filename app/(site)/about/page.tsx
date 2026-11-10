import type { Metadata } from 'next';
import { Rich } from '@/components/site/Rich';
import { Section, SectionHeader } from '@/components/site/Section';
import { content } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About Me',
  description: 'Anotida Manguwe — BSc ICT student at Eden University: background, education, technical skills and career direction in software engineering and cybersecurity.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const { about, education, skillGroups, interests, career } = content;
  const [lead, ...rest] = about.paragraphs;
  return (
    <>
      <Section id="about">
        <SectionHeader label="Who I Am">About <span>Me</span></SectionHeader>
        <Rich as="div" className="history-intro" html={lead} />
        {rest.map((p, i) => (
          <Rich key={i} as="p" className="about-text" html={p} />
        ))}
        <blockquote className="motto">“{about.motto}”</blockquote>
      </Section>

      <Section id="education">
        <SectionHeader label="Education">Academic <span>Background</span></SectionHeader>
        <div className="history-grid">
          <div className="history-card">
            <div className="history-card-year">{education.level}</div>
            <h3>{education.title}</h3>
            <p>{education.school}</p>
          </div>
        </div>
        <div className="skill-group">
          <p className="section-label">Relevant Academic Areas</p>
          <div className="cert-grid">
            {education.areas.map((a) => (
              <div className="cert-tag" key={a}>{a}</div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="skills">
        <SectionHeader label="Technical">Skills &amp; <span>Tools</span></SectionHeader>
        <p className="about-text">These are developing competencies — areas I use, practise and keep growing in.</p>
        {skillGroups.map((g) => (
          <div className="skill-group" key={g.label}>
            <p className="section-label">{g.label}</p>
            <div className="cert-grid">
              {g.items.map((i) => (
                <div className="cert-tag" key={i}>{i}</div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section id="direction">
        <SectionHeader label="Direction">Interests &amp; <span>Career</span></SectionHeader>
        <div className="skill-group">
          <p className="section-label">Professional Interests</p>
          <div className="cert-grid">
            {interests.map((i) => (
              <div className="cert-tag" key={i}>{i}</div>
            ))}
          </div>
        </div>
        <p className="about-text">{career.text}</p>
        <div className="skill-group">
          <p className="section-label">How I Work</p>
          <p className="about-text about-text-tight">{about.philosophy}</p>
          <div className="cert-grid">
            {about.approach.map((a) => (
              <div className="cert-tag" key={a}>{a}</div>
            ))}
          </div>
        </div>
        <div className="history-intro">
          <strong>Career objective.</strong> {career.objective}
        </div>
      </Section>
    </>
  );
}
