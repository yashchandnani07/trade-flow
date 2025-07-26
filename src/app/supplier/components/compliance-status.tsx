
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const complianceItems = [
    { name: "FSSAI License", status: "verified", details: "Expires: 12/2025" },
    { name: "Hygiene Audit", status: "verified", details: "Last: 03/2024" },
    { name: "Pest Control", status: "attention", details: "Next visit: 06/2024" },
];

const ComplianceStatus = () => {
  return (
    <Card className="bg-glass">
        <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Track your regulatory and quality compliance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {complianceItems.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {item.status === 'verified' ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        }
                        <p className="font-medium">{item.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.details}</p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
};

export default ComplianceStatus;
