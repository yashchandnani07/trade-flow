
'use client';
import KeyMetrics from '@/app/supplier/components/key-metrics';
import OrderManagement from '@/app/supplier/components/order-management';
import FactoryDiary from '@/app/supplier/components/factory-diary';
import ComplianceStatus from '@/app/supplier/components/compliance-status';
import BiddingDashboard from '@/app/supplier/components/bidding-dashboard';
import TrustBadges from '@/app/supplier/components/trust-badges';
import { useAuth } from '@/hooks/use-auth';

export default function SupplierDashboardPage() {
    const { user } = useAuth();
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 bg-transparent">
        <section className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h2>
            <p className="text-muted-foreground">Welcome back, {user?.businessName || 'Supplier'}!</p>
        </section>
        <section>
            <KeyMetrics />
        </section>
        <section>
            <TrustBadges />
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <OrderManagement />
            </div>
            <div className="space-y-6">
                <FactoryDiary />
                <ComplianceStatus />
            </div>
        </div>
        <section>
            <BiddingDashboard />
        </section>
    </main>
  );
}
