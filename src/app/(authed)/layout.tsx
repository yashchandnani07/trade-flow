
'use client';
import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    if (!loading && user) {
        const isSupplierPath = pathname.startsWith('/supplier-dashboard');
        
        if (user.role === 'supplier' && !isSupplierPath) {
            router.replace('/supplier-dashboard');
        } else if (user.role !== 'supplier' && pathname === '/') {
             router.replace('/dashboard');
        }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="space-y-4 text-center">
                <p className="text-muted-foreground mt-2">Loading your experience...</p>
            </div>
        </div>
    );
  }

  if (user) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }
  
  return null;
}
