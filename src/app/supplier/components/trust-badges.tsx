
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Zap, Truck, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const badges = [
    { icon: ShieldCheck, label: "Verified Supplier", tooltip: "Passed all background and document checks." },
    { icon: Zap, label: "Quick Responder", tooltip: "Typically responds to bids in under 1 hour." },
    { icon: Truck, label: "On-Time Delivery", tooltip: "95%+ on-time delivery rate." },
    { icon: Star, label: "Top Rated", tooltip: "Maintains an average rating of 4.5 stars or higher." },
];

const TrustBadges = () => {
  return (
    <Card className="bg-glass">
        <CardHeader>
            <CardTitle>Your Trust Badges</CardTitle>
            <CardDescription>Badges earned for excellent service and reliability.</CardDescription>
        </CardHeader>
        <CardContent>
            <TooltipProvider>
                <div className="flex flex-wrap gap-4">
                    {badges.map(badge => (
                        <Tooltip key={badge.label}>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-background/50 w-28 text-center cursor-pointer">
                                    <badge.icon className="w-8 h-8 text-primary" />
                                    <span className="text-xs font-medium">{badge.label}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{badge.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        </CardContent>
    </Card>
  );
};

export default TrustBadges;
