import type { Metadata } from 'next';
import { RichText } from '@/components/site/RichText';
import { Section, SectionHeader } from '@/components/site/Section';
import { getSite } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'About Me',
  description: 'Anotida Manguwe — background, education, technical skills and career direction.',
  alternates: { canonical: '/about' },
};

const Chips = ({ items }: { items: string[] }) => (
  <div className="cert-grid">
    {items.map((i) => (
      <div className="cert-tag" key={i}>{i}</div>
    ))}
  </div>
);

export default async function AboutPage() {
  const { content } = await getSite();
  const { about, education, skillGroups, interests, career } = content;
  const [lead, ...rest] = about.paragraphs;
  return (
    <>
      <Section id="about">
        <SectionHeader label="Who I Am">About <span>Me</span></SectionHeader>
        {lead && <div className="history-intro"><RichText text={lead} /></div>}
        {rest.map((p, i) => (
          <p key={i} className="about-text"><RichText text={p} /></p>
        ))}
        {about.motto && <blockquote className="motto">“{about.motto}”</blockquote>}
      </Section>

      {education.length > 0 && (
        <Section id="education">
          <SectionHeader label="Education">Academic <span>Background</span></SectionHeader>
          {education.map((e) => (
            <div key={e.title + e.level}>
              <div className="history-grid">
                <div className="history-card">
                  {e.level && <div className="history-card-year">{e.level}</div>}
                  <h3>{e.title}</h3>
                  <p>{e.school}</p>
                </div>
              </div>
              {e.areas.length > 0 && (
                <div className="skill-group">
                  <p className="section-label">Relevant Academic Areas</p>
                  <Chips items={e.areas} />
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {skillGroups.length > 0 && (
        <Section id="skills">
          <SectionHeader label="Technical">Skills &amp; <span>Tools</span></SectionHeader>
          <p className="about-text">These are developing competencies — areas I use, practise and keep growing in.</p>
          {skillGroups.map((g) => (
            <div className="skill-group" key={g.label}>
              <p className="section-label">{g.label}</p>
              <Chips items={g.items} />
            </div>
          ))}
        </Section>
      )}

      <Section id="direction">
        <SectionHeader label="Direction">Interests &amp; <span>Career</span></SectionHeader>
        {interests.length > 0 && (
          <div className="skill-group">
            <p className="section-label">Professional Interests</p>
            <Chips items={interests} />
          </div>
        )}
        {career.text && <p className="about-text">{career.text}</p>}
        {(about.philosophy || about.approach.length > 0) && (
          <div className="skill-group">
            <p className="section-label">How I Work</p>
            {about.philosophy && <p className="about-text about-text-tight">{about.philosophy}</p>}
            <Chips items={about.approach} />
          </div>
        )}
        {career.objective && (
          <div className="history-intro">
            <strong>Career objective.</strong> {career.objective}
          </div>
        )}
      </Section>
    </>
  );
}
