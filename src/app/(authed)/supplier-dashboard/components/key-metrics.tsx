
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Truck, Package, CheckCircle } from 'lucide-react';

export default function KeyMetrics() {
    const metrics = [
        { title: "Total Revenue", value: "$1.2M", icon: DollarSign },
        { title: "Orders Shipped", value: "8,942", icon: Truck },
        { title: "Pending Orders", value: "125", icon: Package },
        { title: "Fulfilment Rate", value: "99.2%", icon: CheckCircle },
    ];
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map(metric => (
                <Card key={metric.title} className="glassmorphic">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                        <metric.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metric.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
