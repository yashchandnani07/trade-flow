'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

const ComplianceStatus = () => {
  return (
    <Card className="bg-glass">
      <CardHeader>
        <CardTitle>Compliance Status</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex justify-center items-center">
           <ShieldCheck className="w-16 h-16 text-green-500" />
        </div>
        <p className="font-semibold text-lg mt-2 text-green-400">FSSAI Verified</p>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Expiry Date: <span className="font-medium text-foreground">Dec 15, 2025</span></p>
          <div className="mt-1">
            <Badge variant="destructive" className="animate-pulse">Renewal due in 30 days</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceStatus;
