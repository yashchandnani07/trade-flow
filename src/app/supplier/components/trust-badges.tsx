'use client';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ShieldCheck, Trophy, Truck, Award } from 'lucide-react';

const badges = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
    title: 'FSSAI Certified',
    date: 'Achieved: May 2023',
    borderColor: 'border-blue-500',
  },
  {
    icon: <Truck className="w-8 h-8 text-green-500" />,
    title: 'On-Time Hero',
    date: 'Achieved: Jan 2024',
    borderColor: 'border-green-500',
  },
  {
    icon: <Trophy className="w-8 h-8 text-yellow-500" />,
    title: 'Super Supplier',
    date: 'Achieved: Mar 2024',
    borderColor: 'border-yellow-500',
  },
  {
    icon: <Award className="w-8 h-8 text-teal-500" />,
    title: 'Clean Kitchen',
    date: 'Achieved: Apr 2024',
    borderColor: 'border-teal-500',
  },
];

const TrustBadges = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Trust Badges</h3>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {badges.map((badge, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className={`bg-secondary border-2 ${badge.borderColor} shadow-md transition-transform hover:scale-105`}>
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                    {badge.icon}
                    <p className="font-semibold">{badge.title}</p>
                    <p className="text-xs text-muted-foreground">{badge.date}</p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
};

export default TrustBadges;
