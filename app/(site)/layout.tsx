import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Footer } from '@/components/site/Footer';
import { Loader } from '@/components/site/Loader';
import { Nav } from '@/components/site/Nav';
import { getPortfolio } from '@/lib/portfolio';
import { SITE } from '@/lib/site';
import './extra.css'; // must stay BEFORE globals.css so the original stylesheet wins any tie
import './globals.css';

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

// Pages are rebuilt at most once a minute, and instantly whenever you upload something in /admin.
export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Anotida Manguwe | ICT Student, Software Developer & Student Innovator',
    template: '%s | Anotida Manguwe',
  },
  description:
    'Anotida Manguwe (timtiml) — BSc ICT student at Eden University, Zambia. Building practical software and growing towards a career in software engineering and cybersecurity.',
  keywords: [
    'Anotida Manguwe', 'timtiml', 'ICT student Zambia', 'Eden University', 'software developer', 'student innovator',
    'cybersecurity', 'Campus Crib', 'full-stack development',
  ],
  authors: [{ name: 'Anotida Manguwe' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: SITE.url,
    title: 'Anotida Manguwe | ICT Student & Software Developer',
    description: 'Building ideas into practical technology solutions. ICT student, software developer and student innovator from Zambia.',
  },
  twitter: {
    card: 'summary',
    title: 'Anotida Manguwe',
    description: 'ICT student, software developer and student innovator from Zambia.',
  },
  icons: { icon: '/img1.png' },
};

// Runs before first paint so there is no dark→light flash when a visitor chose the light theme.
const THEME_SCRIPT = `try{if(localStorage.getItem('timtiml-theme')==='light')document.body.classList.add('light')}catch(e){}`;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { cv } = await getPortfolio();
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <noscript>
          <style>{`.fade-in{opacity:1!important;transform:none!important}#loader{display:none!important}`}</style>
        </noscript>
        <Loader />
        <Nav cvUrl={cv?.url} />
        <main>{children}</main>
        <Footer />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${SITE.gaId}');`}
        </Script>
      </body>
    </html>
  );
}
