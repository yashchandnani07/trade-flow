import KeyMetrics from './components/key-metrics';
import TrustBadges from './components/trust-badges';
import OrderManagement from './components/order-management';
import BiddingDashboard from './components/bidding-dashboard';
import FactoryDiary from './components/factory-diary';
import ComplianceStatus from './components/compliance-status';

export default function SupplierPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">
        Supplier Dashboard
      </h2>
      <KeyMetrics />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TrustBadges />
          <OrderManagement />
        </div>
        <div className="space-y-6">
          <BiddingDashboard />
          <FactoryDiary />
          <ComplianceStatus />
        </div>
      </div>
    </div>
  );
}
