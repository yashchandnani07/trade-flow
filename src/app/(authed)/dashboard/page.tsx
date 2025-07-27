
'use client';
import { OrderHistory } from "@/components/dashboard/order-history";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SupplierReviews } from "@/components/dashboard/supplier-reviews";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { seedDatabase } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import VendorStockBasket from "./components/vendor-stock-basket";

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSeed = async () => {
    toast({
      title: "Database Seeding",
      description: "Seeding in progress... Please wait.",
    });
    const result = await seedDatabase();
    if (result.success) {
      toast({
        title: "Database Seeding Complete",
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

  return (
    <div className="space-y-8">
        <section className="flex justify-between items-center" id="overview">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={handleSeed} variant="outline">Seed Database</Button>
        </section>
        
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle>Welcome back, {user?.businessName || "User"}!</CardTitle>
                <CardDescription>Here's a quick overview of your supply chain.</CardDescription>
            </CardHeader>
        </Card>

        <section>
          <OverviewCards />
        </section>

        <div className="grid gap-8 lg:grid-cols-1" id="tracking-and-alerts">
          <div className="lg:col-span-2">
              <RecentOrders />
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
        <section id="stock">
            <VendorStockBasket />
        </section>
    </div>
    );
}
