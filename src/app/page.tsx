
'use client';
import { AppHeader } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { AlertsSection } from "@/components/dashboard/alerts-section";
import { OrderHistory } from "@/components/dashboard/order-history";
import { OrderTracking } from "@/components/dashboard/order-tracking";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SupplierReviews } from "@/components/dashboard/supplier-reviews";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { seedDatabase } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import SupplierListPage from "./supplier/page";
import { usePathname } from "next/navigation";
import RootLayout from "./layout";

export default function Home() {
  const { toast } = useToast();
  const pathname = usePathname();

  const handleSeed = async () => {
    const result = await seedDatabase();
    if (result.success) {
      toast({
        title: "Database Seeding",
        description: result.message,
      });
    } else {
       toast({
        variant: "destructive",
        title: "Database Seeding Failed",
        description: result.message,
      });
    }
  };

  const isSupplierPage = pathname.startsWith('/supplier');

  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          {isSupplierPage ? (
            <SupplierListPage />
          ) : (
            <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 bg-transparent">
              <section className="flex justify-between items-center" id="overview">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <Button onClick={handleSeed} variant="outline">Seed Database</Button>
              </section>
              <section>
                <OverviewCards />
              </section>
              <div className="grid gap-8 lg:grid-cols-3" id="tracking">
                <div className="lg:col-span-2">
                  <OrderTracking />
                </div>
                <div>
                  <AlertsSection />
                </div>
              </div>
              <div className="grid gap-8 lg:grid-cols-5" id="history">
                <div className="lg:col-span-3">
                  <OrderHistory />
                </div>
                <div className="lg:col-span-2" id="reviews">
                  <SupplierReviews />
                </div>
              </div>
            </main>
          )}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
