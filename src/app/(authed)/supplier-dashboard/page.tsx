
'use client';
import KeyMetrics from './components/key-metrics';
import OrderManagement from './components/order-management';
import ComplianceStatus from './components/compliance-status';
import { MarketplaceBidsList } from '@/components/bids/marketplace-bids-list';
import TrustBadges from './components/trust-badges';
import { useAuth } from '@/hooks/use-auth';
import StockBasket from './components/stock-basket';
import FactoryDiary from './components/factory-diary';
import { AlertsSection } from './components/alerts-section';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/app/actions';

export default function SupplierDashboardPage() {
    const { user } = useAuth();
    const { toast } = useToast();

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
    <main className="flex-1 space-y-8 bg-transparent">
        <section className="space-y-2 flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h2>
                <p className="text-muted-foreground">Welcome back, {user?.businessName || 'Supplier'}!</p>
            </div>
            <Button onClick={handleSeed} variant="outline">Seed Database</Button>
        </section>
        <section>
            <KeyMetrics />
        </section>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <OrderManagement />
                <section id="stock">
                    <StockBasket />
                </section>
            </div>
            <div className="space-y-6">
                <section id="alerts">
                    <AlertsSection />
                </section>
                <ComplianceStatus />
                <section id="badges">
                    <TrustBadges />
                </section>
                <FactoryDiary />
            </div>
        </div>
        <section id="bids">
            <MarketplaceBidsList />
        </section>
    </main>
  );
}
