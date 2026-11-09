import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/admin.html', destination: '/admin', permanent: true },
      // Old pages (lessons, pricing, …) that no longer exist → send visitors home instead of a dead end.
      ...['python-lessons', 'c-lessons', 'cpp-lessons', 'csharp-lessons', 'css-lessons', 'html-lessons', 'java-lessons', 'lessons', 'cybersecurity', 'olevel-cs', 'alevel-cs'].map((f) => ({ source: `/${f}.html`, destination: '/', permanent: true })),
      { source: '/learn/:course', destination: '/', permanent: false },
      ...['pricing', 'faq', 'blog', 'design', 'web-dev', 'learn'].map((page) => ({ source: `/${page}`, destination: '/', permanent: false })),
    ];
  },
};

export default config;
