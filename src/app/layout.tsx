import '@/app/global.css';
import { Inter } from 'next/font/google';
import { Provider } from '@/app/provider';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

// src/app/layout.tsx
export const metadata: Metadata = {
  title: 'Polygon Payments Docs',
  description: 'Polygon payments documentation',
  icons: {
    icon: [
      { url: '/icon.svg', sizes: 'any' }
    ],
    shortcut: ['/icon.svg'],
  },
};