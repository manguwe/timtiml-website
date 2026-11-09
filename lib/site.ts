/** Single source of truth for contact details and links used across the whole site. */
export const SITE = {
  name: 'TIMTIML',
  owner: 'Anotida Manguwe',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://timtiml-website.vercel.app',
  whatsapp: '260768648291',
  whatsappDisplay: '+260 768 648 291',
  email: 'anotida30manguwe12@gmail.com',
  gaId: 'G-GZ0V0S0DWT',
  /** Contact form endpoint (Formspree) — sends messages to your inbox. */
  formspree: 'https://formspree.io/f/mdablpde',
  links: {
    telegram: 'https://t.me/timtiml',
    linkedin: 'https://www.linkedin.com/in/timtiml/',
    facebook: 'https://www.facebook.com/anotida.manguwe.9',
    instagram: 'https://instagram.com/timtiml',
    threads: 'https://www.threads.net/@timtiml',
    github: 'https://github.com/manguwe',
    whatsappChannel: 'https://whatsapp.com/channel/0029VbAZUgU0lwgr2D5i3b1c',
  },
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Documents', href: '/documents' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Build a wa.me link. Message text is plain text — encoding is handled here, once. */
export function wa(text?: string | null, number: string = SITE.whatsapp): string {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
