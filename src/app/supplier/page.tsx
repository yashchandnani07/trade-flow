import KeyMetrics from './components/key-metrics';
import TrustBadges from './components/trust-badges';
import OrderManagement from './components/order-management';
import BiddingDashboard from './components/bidding-dashboard';
import FactoryDiary from './components/factory-diary';
import ComplianceStatus from './components/compliance-status';

export default function SupplierPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-card">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Supplier Dashboard
      </h2>
      <KeyMetrics />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TrustBadges />
          <OrderManagement />
          <BiddingDashboard />
        </div>
        <div className="space-y-6">
          <FactoryDiary />
          <ComplianceStatus />
        </div>
      </div>
    </div>
  );
}
