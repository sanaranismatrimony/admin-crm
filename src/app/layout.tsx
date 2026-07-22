import type { Metadata } from 'next';
import { Inter, Noto_Sans_Telugu } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  display: 'swap',
  variable: '--font-noto-telugu',
});

export const metadata: Metadata = {
  title: 'Sana Rani Matrimony',
  description: 'Private matchmaking management platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${notoSansTelugu.variable}`} suppressHydrationWarning>
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e) {}
            })();
          `,
        }}
      />
      <body className="min-h-full antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
