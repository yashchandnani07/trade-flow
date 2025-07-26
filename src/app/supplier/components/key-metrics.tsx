'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Flame, Bell, ShieldCheck } from 'lucide-react';

const KeyMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-glass">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Supplier Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">4,120</div>
          <Progress value={75} className="mt-4 h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            75% to next reward tier
          </p>
        </CardContent>
      </Card>
      <Card className="bg-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Performance Streak
          </CardTitle>
          <Flame className="text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">42 <span className="text-2xl text-muted-foreground">Days</span></div>
          <p className="text-xs text-muted-foreground mt-2">
            Consecutive successful orders
          </p>
        </CardContent>
      </Card>
      <Card className="bg-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Satisfaction Rating
          </CardTitle>
          <Star className="text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">4.8<span className="text-2xl text-muted-foreground">/5</span></div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on 1,580 reviews
          </p>
        </CardContent>
      </Card>
      <Card className="bg-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Compliance Alerts
          </CardTitle>
           <div className="relative">
             <ShieldCheck className="text-blue-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white">1</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">1 <span className="text-2xl text-muted-foreground">Alert</span></div>
          <p className="text-xs text-muted-foreground mt-2">
            FSSAI Renewal due
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyMetrics;
