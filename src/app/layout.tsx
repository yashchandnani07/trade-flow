
import './globals.css';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Trade Flow',
  description: 'Streamlining Supply Chains',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="min-h-screen">
                <AppSidebar />
                <SidebarInset>
                    <AppHeader />
                    <main>
                      {children}
                    </main>
                </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
