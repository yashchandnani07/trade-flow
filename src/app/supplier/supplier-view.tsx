'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bell,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Flame,
  Gavel,
  Gem,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const KeyMetrics = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Supplier Points</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-primary">4,120</div>
        <Progress value={75} className="mt-2" />
        <p className="text-sm text-muted-foreground mt-1">
          75% to next reward tier
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Flame className="w-8 h-8 text-orange-500" />
          <div className="text-4xl font-bold">42 Days</div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Consecutive successful orders
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Satisfaction Rating</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Star className="w-8 h-8 text-yellow-400" />
          <div className="text-4xl font-bold">4.8/5</div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Based on 1,580 reviews
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Bell className="w-8 h-8 text-blue-500" />
          <div className="text-4xl font-bold">3 New</div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Market insights available
        </p>
      </CardContent>
    </Card>
  </div>
);

const TrustBadges = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Trust Badges</h3>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-blue-500">
        <CardContent className="p-4 flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <div>
            <p className="font-semibold">FSSAI Certified</p>
            <p className="text-xs text-muted-foreground">Achieved: Jan 2023</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-green-500">
        <CardContent className="p-4 flex items-center gap-4">
          <Trophy className="w-8 h-8 text-green-500" />
          <div>
            <p className="font-semibold">On-Time Hero</p>
            <p className="text-xs text-muted-foreground">98% Success Rate</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-yellow-500">
        <CardContent className="p-4 flex items-center gap-4">
          <Gem className="w-8 h-8 text-yellow-500" />
          <div>
            <p className="font-semibold">Super Supplier</p>
            <p className="text-xs text-muted-foreground">Top 5% Performer</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-teal-500">
        <CardContent className="p-4 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-teal-500" />
          <div>
            <p className="font-semibold">Clean Kitchen</p>
            <p className="text-xs text-muted-foreground">Hygiene Certified</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const OrderManagement = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Order Management</h3>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Order #005 • Stellar Solutions</CardTitle>
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Processing
          </Badge>
        </div>
        <CardDescription>$500.00 • 1 day ago</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Order Placed (Jun 20, 10:30 AM)</p>
          <p>In Production (Started Jun 21, 9:00 AM)</p>
          <p className="text-primary font-semibold">Quality Check [Current]</p>
        </div>
        <Progress value={66} className="mt-2" />
      </CardContent>
    </Card>
  </div>
);

const BiddingDashboard = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Bidding Dashboard</h3>
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Active Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">200kg Chicken (Pune Market)</p>
              <div className="flex justify-between items-center">
                <p>
                  Your Bid: <span className="text-primary">₹8,500 (Leading)</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Time remaining: 3h 12m
                </p>
              </div>
            </div>
            <Button className="w-full">View Bid</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Won Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <Gavel className="mx-auto w-8 h-8 mb-2" />
            <p>No recently won bids.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const FactoryDiary = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Factory Diary</h3>
    <Card>
      <CardHeader>
        <CardTitle>Production Batch #F-228</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l border-gray-200 dark:border-gray-700">
          <li className="mb-6 ml-4">
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Materials Received
            </h3>
          </li>
          <li className="mb-6 ml-4">
            <div className="absolute w-3 h-3 bg-blue-500 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
            <h3 className="text-lg font-semibold text-blue-500">
              In Production (Day 3/7)
            </h3>
          </li>
          <li className="ml-4">
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
              Quality Control
            </h3>
          </li>
        </ol>
      </CardContent>
    </Card>
  </div>
);

const ComplianceStatus = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Compliance Status</h3>
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <img
            src="https://i.imgur.com/S8ahA2x.png"
            alt="FSSAI Logo"
            className="w-12 h-12"
          />
          <div>
            <CardTitle>FSSAI License</CardTitle>
            <CardDescription>Verified</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Expiry Date: <span className="font-semibold">Dec 15, 2025</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Renewal reminder will be sent 30 days prior.
        </p>
      </CardContent>
    </Card>
  </div>
);

export const SupplierView = () => {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h2>
      <section id="metrics">
        <KeyMetrics />
      </section>
      <section id="trust-badges">
        <TrustBadges />
      </section>
      <section id="orders">
        <OrderManagement />
      </section>
      <section id="bidding">
        <BiddingDashboard />
      </section>
      <section id="diary">
        <FactoryDiary />
      </section>
      <section id="compliance">
        <ComplianceStatus />
      </section>
    </div>
  );
};
