"use client";
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  Package,
  Star,
  Bell,
  BarChart2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import StatsCardsGrid from '@/components/dashboard/stats-cards-grid';
import { ProductDiscovery } from './supplier/components/product-discovery';

const recentOrders = [
  {
    orderId: '#ORD001',
    customer: 'Stellar Solutions',
    amount: '$1,250.00',
    status: 'Delivered',
    date: '5 days ago',
  },
  {
    orderId: '#ORD002',
    customer: 'Cosmic Co.',
    amount: '$800.50',
    status: 'Shipped',
    date: '2 days ago',
  },
  {
    orderId: '#ORD003',
    customer: 'Galaxy Goods',
    amount: '$450.00',
    status: 'Processing',
    date: '1 day ago',
  },
  {
    orderId: '#ORD004',
    customer: 'Nova Supplies',
    amount: '$2,100.00',
    status: 'Delivered',
    date: '1 week ago',
  },
];

const statusColors = {
  Delivered: 'bg-green-100 text-green-800',
  Shipped: 'bg-blue-100 text-blue-800',
  Processing: 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const [isVendor, setIsVendor] = React.useState(true);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>

      <section id="overview">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <StatsCardsGrid />
      </section>

      <section id="products">
        <h3 className="text-xl font-semibold mb-4">Product Discovery</h3>
        <ProductDiscovery />
      </section>

      <section id="orders">
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
        <Card className="shadow-sm">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">
                      {order.orderId}
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          statusColors[order.status as keyof typeof statusColors]
                        } hover:${
                          statusColors[order.status as keyof typeof statusColors]
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section id="analytics">
        <h3 className="text-xl font-semibold mb-4">Analytics</h3>
        <Card>
          <CardHeader>
            <CardTitle>Sales Trends</CardTitle>
            <CardDescription>
              A chart showing sales trends would go here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
              <BarChart2 className="h-16 w-16 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
