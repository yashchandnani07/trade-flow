import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

const ComplianceStatus = () => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-white">Compliance Status</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex justify-center items-center">
           <ShieldCheck className="w-16 h-16 text-green-500" />
        </div>
        <p className="font-semibold text-lg mt-2 text-green-600 dark:text-green-400">FSSAI Verified</p>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <p>Expiry Date: <span className="font-medium text-gray-800 dark:text-white">Dec 15, 2025</span></p>
          <p className="mt-1">
            <Badge variant="destructive" className="animate-pulse">Renewal due in 30 days</Badge>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceStatus;
