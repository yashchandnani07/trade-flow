
'use client';
import KeyMetrics from './components/key-metrics';
import ComplianceStatus from './components/compliance-status';
import TrustBadges from './components/trust-badges';
import { useAuth } from '@/hooks/use-auth';
import StockBasket from './components/stock-basket';
import FactoryDiary from './components/factory-diary';
import { AlertsSection } from './components/alerts-section';

export default function SupplierDashboardPage() {
    const { user } = useAuth();

  return (
    <main className="flex-1 space-y-8 bg-transparent">
        <section className="space-y-2 flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h2>
                <p className="text-muted-foreground">Welcome back, {user?.businessName || 'Supplier'}!</p>
            </div>
        </section>
        <section>
            <KeyMetrics />
        </section>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
                <section id="diary">
                    <FactoryDiary />
                </section>
            </div>
        </div>
    </main>
  );
}
