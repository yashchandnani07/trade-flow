'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Flame, Bell } from 'lucide-react';

const KeyMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Supplier Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gray-800 dark:text-white">4,120</div>
          <Progress value={75} className="mt-4 h-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            75% to next reward tier
          </p>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Performance Streak
          </CardTitle>
          <Flame className="text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gray-800 dark:text-white">42 <span className="text-2xl text-gray-500 dark:text-gray-400">Days</span></div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Consecutive successful orders
          </p>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Satisfaction Rating
          </CardTitle>
          <Star className="text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gray-800 dark:text-white">4.8<span className="text-2xl text-gray-500 dark:text-gray-400">/5</span></div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Based on 1,580 reviews
          </p>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            AI Alerts
          </CardTitle>
          <div className="relative">
            <Bell className="text-blue-500" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white">3</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gray-800 dark:text-white">3 <span className="text-2xl text-gray-500 dark:text-gray-400">New</span></div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Market insights available
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyMetrics;
