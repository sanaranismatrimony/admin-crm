import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
