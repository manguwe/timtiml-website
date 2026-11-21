import type { Metadata } from 'next';
import { ContactForm } from '@/components/site/ContactForm';
import { Section, SectionHeader } from '@/components/site/Section';
import { getSite } from '@/lib/portfolio';
import { wa } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Anotida Manguwe — WhatsApp, email and social links.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const { content } = await getSite();
  const c = content.contact;
  const details = [
    c.whatsapp && { icon: '📱', title: 'WhatsApp', label: c.phone || `+${c.whatsapp}`, href: wa(undefined, c.whatsapp) },
    c.email && { icon: '📧', title: 'Email', label: c.email, href: `mailto:${c.email}` },
    c.location && { icon: '📍', title: 'Based in', label: c.location, href: '' },
    c.telegram && { icon: '💬', title: 'Telegram', label: c.telegram.replace(/^https?:\/\/t\.me\//, '@'), href: c.telegram },
    c.linkedin && { icon: '💼', title: 'LinkedIn', label: 'Anotida Manguwe', href: c.linkedin },
  ].filter(Boolean) as { icon: string; title: string; label: string; href: string }[];
  const socials = [
    c.github && { label: '🐙 GitHub', href: c.github },
    c.facebook && { label: '📘 Facebook', href: c.facebook },
    c.instagram && { label: '📸 Instagram', href: c.instagram },
    c.threads && { label: '🧵 Threads', href: c.threads },
    c.whatsappChannel && { label: '📡 WA Channel', href: c.whatsappChannel },
  ].filter(Boolean) as { label: string; href: string }[];
  return (
    <Section id="contact">
      <SectionHeader label="Connect">Get in <span>Touch</span></SectionHeader>
      <div className="contact-three-col contact-two-col">
        <div className="contact-info-col">
          <p className="contact-lead">
            Want to work together, ask a question, or just say hello? Reach out on any of these — I&apos;d love to hear from you.
          </p>
          {details.map((d) => (
            <div className="contact-item" key={d.title}>
              <div className="contact-icon-wrap">{d.icon}</div>
              <div className="contact-detail">
                <h4>{d.title}</h4>
                {d.href ? <a href={d.href} target={d.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">{d.label}</a> : <span>{d.label}</span>}
              </div>
            </div>
          ))}
          <div className="socials-grid contact-socials">
            {socials.map((s) => (
              <a key={s.label} className="social-btn" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
            ))}
          </div>
        </div>
        <div className="contact-form-col">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
