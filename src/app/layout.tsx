import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ajaia Docs | Lightweight Collaborative Document Platform',
  description: 'Fast, elegant collaborative document drafting, rich-text editing, file imports, and access control.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
