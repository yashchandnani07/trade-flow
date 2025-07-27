
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Clock, Award } from 'lucide-react';

export default function TrustBadges() {
    const badges = [
        { name: "Quality Certified", icon: ShieldCheck },
        { name: "On-Time Delivery", icon: Clock },
        { name: "Top Supplier 2024", icon: Award },
    ]
    return (
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle>Trust Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {badges.map(badge => (
                     <Badge key={badge.name} variant="secondary" className="text-base p-2">
                        <badge.icon className="mr-2 h-4 w-4" />
                        {badge.name}
                    </Badge>
                ))}
            </CardContent>
        </Card>
    )
}
