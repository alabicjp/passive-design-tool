import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'パッシブデザイン提案ツール',
  description: '季節ごとの日照・通風シミュレーションを活用したパッシブデザイン提案ツール',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
