import { AppHeader } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { AlertsSection } from "@/components/dashboard/alerts-section";
import { OrderHistory } from "@/components/dashboard/order-history";
import { OrderTracking } from "@/components/dashboard/order-tracking";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SupplierReviews } from "@/components/dashboard/supplier-reviews";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 bg-transparent">
            <OverviewCards />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <OrderTracking />
              </div>
              <div>
                <AlertsSection />
              </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <OrderHistory />
              </div>
              <div className="lg:col-span-2">
                <SupplierReviews />
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
