import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { SessionProvider } from 'next-auth/react';
import ThemeRegistry from '@/components/ThemeRegistry';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cathedis - Gestion du Parc Informatique',
  description: 'Plateforme de gestion de parc informatique pour Cathedis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <SessionProvider>
            <ThemeRegistry>
              {children}
            </ThemeRegistry>
          </SessionProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
