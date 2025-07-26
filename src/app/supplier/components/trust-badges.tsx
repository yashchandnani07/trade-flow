'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Rocket, Star, Package } from 'lucide-react';

const badges = [
  {
    icon: <Award className="w-8 h-8 text-yellow-400" />,
    title: 'Quality',
    bgColor: 'bg-yellow-400/10',
    glowColor: 'shadow-yellow-400/20',
  },
  {
    icon: <Rocket className="w-8 h-8 text-white" />,
    title: 'Speed Demon',
    bgColor: 'bg-white/10',
    glowColor: 'shadow-white/20',
  },
  {
    icon: <Star className="w-8 h-8 text-orange-400" />,
    title: '5-Star Rating',
    bgColor: 'bg-orange-400/10',
    glowColor: 'shadow-orange-400/20',
  },
  {
    icon: <Package className="w-8 h-8 text-teal-400" />,
    title: 'First Order',
    bgColor: 'bg-teal-400/10',
    glowColor: 'shadow-teal-400/20',
  },
];

const BadgeCard = ({ badge }: { badge: (typeof badges)[0] }) => (
    <div className="flex flex-col items-center justify-center space-y-2">
         <div className={`relative flex items-center justify-center w-16 h-16 rounded-full ${badge.bgColor}`}>
            <div className={`absolute inset-0 rounded-full shadow-lg ${badge.glowColor} animate-pulse`}></div>
            {badge.icon}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{badge.title}</p>
    </div>
);


const TrustBadges = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Trust Badges</h3>
      <Card className="bg-glass">
        <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {badges.map((badge, index) => (
                    <BadgeCard key={index} badge={badge} />
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustBadges;
