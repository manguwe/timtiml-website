import type { Metadata } from 'next';
import { ContactForm } from '@/components/site/ContactForm';
import { Section, SectionHeader } from '@/components/site/Section';
import { SITE, wa } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Anotida Manguwe — WhatsApp, email, Telegram and social media.',
  alternates: { canonical: '/contact' },
};

const DETAILS = [
  { icon: '📱', title: 'WhatsApp', label: SITE.whatsappDisplay, href: wa() },
  { icon: '📧', title: 'Email', label: SITE.email, href: `mailto:${SITE.email}` },
  { icon: '💬', title: 'Telegram', label: '@timtiml', href: SITE.links.telegram },
  { icon: '💼', title: 'LinkedIn', label: 'Anotida Manguwe', href: SITE.links.linkedin },
];

const SOCIALS = [
  { label: '📘 Facebook', href: SITE.links.facebook },
  { label: '💬 WhatsApp', href: wa() },
  { label: '📸 Instagram', href: SITE.links.instagram },
  { label: '🧵 Threads', href: SITE.links.threads },
  { label: '📡 WA Channel', href: SITE.links.whatsappChannel },
  { label: '🐙 GitHub', href: SITE.links.github },
];

export default function ContactPage() {
  return (
    <Section id="contact">
      <SectionHeader label="Connect">Get in <span>Touch</span></SectionHeader>
      <div className="contact-three-col contact-two-col">
        <div className="contact-info-col">
          <p className="contact-lead">
            Want to work together, ask a question, or just say hello? Reach out on any of these — I&apos;d love to hear from you.
          </p>
          {DETAILS.map((d) => (
            <div className="contact-item" key={d.title}>
              <div className="contact-icon-wrap">{d.icon}</div>
              <div className="contact-detail">
                <h4>{d.title}</h4>
                <a href={d.href} target={d.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">{d.label}</a>
              </div>
            </div>
          ))}
          <div className="socials-grid contact-socials">
            {SOCIALS.map((s) => (
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
