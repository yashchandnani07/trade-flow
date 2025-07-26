
'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // While loading, show a loading skeleton.
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="space-y-4 text-center">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
                <p className="text-muted-foreground mt-2">Loading your dashboard...</p>
            </div>
        </div>
    );
  }

  // If loading is finished and there is a user, show the authed layout.
  if (user) {
    return (
      <SidebarProvider>
        <div className="min-h-screen">
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main>{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }
  
  // If not loading and no user, this will be handled by the useEffect redirect,
  // but we can return null to avoid a brief flash of content.
  return null;
}
