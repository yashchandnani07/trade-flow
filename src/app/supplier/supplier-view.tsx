
'use client';
import React from 'react';
import StatsCardsGrid from '@/components/dashboard/stats-cards-grid';
import { ProductDiscovery } from './components/product-discovery';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart2 } from 'lucide-react';

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
];

const statusColors: { [key: string]: string } = {
    Delivered: 'border-green-500/50 bg-green-500/10 text-green-400',
    Shipped: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
    Processing: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
    Cancelled: 'border-red-500/50 bg-red-500/10 text-red-400',
};


export const SupplierView = () => {
  return (
    <div className="space-y-8">
      <section id="overview">
        <h2 className="text-2xl font-semibold mb-4">Supplier Dashboard</h2>
        <StatsCardsGrid />
      </section>

      <section id="product-discovery">
        <ProductDiscovery />
      </section>

      <section id="recent-orders">
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
        <Card className="shadow-sm">
          <CardContent className="p-0">
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
                      <Badge variant="outline" className={statusColors[order.status]}>
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
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-secondary rounded-md flex items-center justify-center">
              <BarChart2 className="h-16 w-16 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
