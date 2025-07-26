import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Package, Truck, CheckCircle } from "lucide-react";
import { Separator } from "../ui/separator";

const trackingSteps = [
    {
        icon: Package,
        title: "Order Placed",
        date: "May 20, 2024, 10:30 AM",
        status: "completed",
    },
    {
        icon: Truck,
        title: "Shipped",
        date: "May 21, 2024, 02:00 PM",
        status: "completed",
    },
    {
        icon: Truck,
        title: "In Transit",
        date: "May 22, 2024, 08:00 AM",
        status: "active",
    },
    {
        icon: CheckCircle,
        title: "Delivered",
        date: "Est. May 24, 2024",
        status: "pending",
    },
];

export function OrderTracking() {
  return (
    <Card className="h-full glassmorphic">
      <CardHeader>
        <CardTitle>Order Tracking</CardTitle>
        <CardDescription>
          Live tracking for order #ORD002
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Image
            src="https://placehold.co/800x250"
            alt="Map showing order route"
            width={800}
            height={250}
            className="rounded-lg object-cover w-full"
            data-ai-hint="world map"
          />
        </div>
        <Separator />
        <div className="relative space-y-8">
          {trackingSteps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                 <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step.status === 'completed' || step.status === 'active' ? 'bg-primary' : 'bg-muted'}`}>
                    <step.icon className={`h-5 w-5 ${step.status === 'completed' || step.status === 'active' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                </div>
                {index < trackingSteps.length - 1 && (
                    <div className={`w-0.5 grow ${step.status === 'completed' ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
              <div className="flex-1 pt-1.5">
                <p className={`font-semibold ${step.status === 'active' ? 'text-primary' : ''}`}>{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
