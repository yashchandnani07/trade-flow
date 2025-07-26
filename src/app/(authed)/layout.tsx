
'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuthedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the loading is complete before checking for a user.
    if (!loading) {
      if (!user) {
        // If there's no user, always redirect to the root page.
        router.replace('/');
      } else {
        // Handle role-based redirects only when a user is confirmed.
        const isSupplierDashboard = window.location.pathname.startsWith('/supplier-dashboard');
        const isVendorArea = window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/bidding') || window.location.pathname.startsWith('/supplier');
        if (user.role === 'supplier' && !isSupplierDashboard) {
            router.replace('/supplier-dashboard');
        } else if (user.role !== 'supplier' && isSupplierDashboard) {
             router.replace('/dashboard');
        }
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background light:bg-transparent">
            <div className="space-y-4 text-center flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground mt-2 light:text-white/80">Loading your experience...</p>
            </div>
        </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className={cn("flex min-h-screen w-full", "dark:bg-background")}>
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8" style={{ scrollBehavior: 'smooth' }}>
            <div className="dark:bg-card dark:p-6 dark:rounded-lg">
                {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
