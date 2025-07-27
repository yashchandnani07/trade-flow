
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Clock, Award, PartyPopper, LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// A mapping from badge names to icons
const badgeIconMap: Record<string, LucideIcon> = {
    "Newly Joined": PartyPopper,
    "Quality Certified": ShieldCheck,
    "On-Time Delivery": Clock,
    "Top Supplier 2024": Award,
};

const defaultBadges = [
    { name: "Quality Certified", icon: ShieldCheck },
    { name: "On-Time Delivery", icon: Clock },
    { name: "Top Supplier 2024", icon: Award },
]

export default function TrustBadges() {
    const { user } = useAuth();
    
    // Use the user's badges if they exist, otherwise use the default static badges for display purposes
    const badgesToDisplay = user?.badges && user.badges.length > 0 
        ? user.badges.map(b => ({ name: b.name, icon: badgeIconMap[b.name] || Award }))
        : [];


    return (
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle>Trust Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {badgesToDisplay.length > 0 ? (
                    badgesToDisplay.map(badge => {
                        const Icon = badge.icon;
                        return (
                             <Badge key={badge.name} variant="secondary" className="text-base p-2">
                                <Icon className="mr-2 h-4 w-4" />
                                {badge.name}
                            </Badge>
                        )
                    })
                ) : (
                    <p className="text-sm text-muted-foreground">No badges earned yet.</p>
                )}
            </CardContent>
        </Card>
    )
}
