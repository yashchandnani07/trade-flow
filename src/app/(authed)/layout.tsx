
'use client';
import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
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
        // Redirect logic based on role
        const isSupplierPath = pathname.startsWith('/supplier-dashboard');
        const isVendorPath = pathname.startsWith('/dashboard') || pathname.startsWith('/supplier');

        if (user.role === 'supplier' && !isSupplierPath) {
            router.replace('/supplier-dashboard');
        } else if (user.role !== 'supplier' && !isVendorPath) {
            router.replace('/dashboard');
        }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="space-y-4 text-center">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
                <p className="text-muted-foreground mt-2">Loading your experience...</p>
            </div>
        </div>
    );
  }

  if (user) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-background flex">
          <AppSidebar />
          <div className="flex flex-col w-full">
            <AppHeader />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }
  
  return null;
}
