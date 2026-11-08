import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Devora — From Ideas to Impact, Faster.',
  description:
    'Devora brings your code, documents, and career tools together with AI — so you can plan, build, and grow without switching between dozens of apps.',
  icons: {
    icon: '/images/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-white focus:text-teal-900 focus:rounded-xl focus:shadow-xl focus:border focus:border-teal-700 font-bold"
        >
          Skip to content
        </a>

        {/* Global SVG Symbol Library */}
        <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <defs>
            <symbol id="devora-mark" viewBox="0 0 40 44">
              <path d="M20 2 37 12v20L20 42 3 32V12Z" fill="#0f766e" />
              <path d="m20 2 17 10-17 10L3 12Z" fill="#14b8a6" />
              <path d="M20 22v20L3 32V12Z" fill="#0b4f4a" />
              <path d="m20 12 9 5v10l-9 5-9-5V17Z" fill="white" />
              <path d="m20 12 9 5-9 5-9-5Z" fill="#ccfbf1" />
              <path d="M20 22v10l9-5V17Z" fill="#5eead4" />
            </symbol>
            <symbol id="curved-arrow" viewBox="0 0 90 70">
              <path
                d="M6 6c20 40 48 52 78 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M72 38l12 8-14 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </symbol>
            <symbol id="logo-mark" viewBox="0 0 32 36">
              <defs>
                <linearGradient id="lm-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#14b8a6" />
                  <stop offset="1" stopColor="#0f766e" />
                </linearGradient>
              </defs>
              <path d="M4 2h12c8 0 14 6 14 16S24 34 16 34H4z" fill="url(#lm-grad)" />
              <path d="M10 9h5c5 0 8 3.5 8 9s-3 9-8 9h-5z" fill="#fbfaf6" />
              <circle cx="26" cy="7" r="3" fill="#f59e0b" />
            </symbol>
          </defs>
        </svg>

        {children}
      </body>
    </html>
  );
}
