'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const orders = {
  active: [
    {
      id: '#005',
      supplier: 'Stellar Solutions',
      amount: '$500.00',
      date: '1 day ago',
      status: 'Processing',
      timeline: [
        { status: 'Order Placed', time: 'Jun 20, 10:30 AM', completed: true },
        { status: 'Vendor Confirmed', time: 'Jun 20, 11:00 AM', completed: true },
        { status: 'In Production', time: 'Started Jun 21, 9:00 AM', completed: true },
        { status: 'Quality Check', time: 'Current', completed: false, current: true },
      ],
    },
     {
      id: '#006',
      supplier: 'Apex Logistics',
      amount: '$750.00',
      date: '3 days ago',
      status: 'Shipped',
      timeline: [
        { status: 'Order Placed', time: 'Jun 18, 2:00 PM', completed: true },
        { status: 'Vendor Confirmed', time: 'Jun 18, 2:30 PM', completed: true },
        { status: 'In Production', time: 'Started Jun 19, 8:00 AM', completed: true },
        { status: 'Quality Check', time: 'Completed Jun 20, 5:00 PM', completed: true },
        { status: 'Shipped', time: 'Current', completed: false, current: true },
      ],
    },
  ],
  history: [
    { id: '#001', supplier: 'Quantum Supplies', amount: '$350.75', date: '2 months ago', status: 'Delivered' },
    { id: '#002', supplier: 'Nexus Components', amount: '$1250.00', date: '3 months ago', status: 'Delivered' },
    { id: '#003', supplier: 'Fusion Foods', amount: '$250.00', date: '4 months ago', status: 'Cancelled' },
  ],
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Processing':
      return 'text-blue-400 border-blue-400/50';
    case 'Shipped':
      return 'text-purple-400 border-purple-400/50';
    case 'Delivered':
      return 'text-green-400 border-green-400/50';
    case 'Cancelled':
      return 'text-red-400 border-red-400/50';
    default:
      return 'text-muted-foreground border-muted-foreground/50';
  }
};

const OrderCard = ({ order }: { order: any }) => (
  <Card className="bg-secondary/50 mb-4">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">
            Order {order.id} <span className="text-muted-foreground">•</span> {order.supplier}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.amount} • {order.date}
          </p>
        </div>
        <Badge variant="outline" className={getStatusClass(order.status)}>{order.status}</Badge>
      </div>
      {order.timeline && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-muted-foreground mb-2">Order Timeline:</p>
          <div className="flex flex-col space-y-2 text-xs">
            {order.timeline.map((item: any, index: number) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${item.completed ? 'bg-primary' : 'bg-muted-foreground/50'} ${item.current ? 'animate-pulse' : ''}`}></div>
                <span className={`font-medium ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.status}
                </span>
                <span className="ml-auto text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  return (
    <Card className="bg-glass">
        <CardHeader>
            <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex space-x-2 mb-4 border-b border-border">
                <Button
                variant={activeTab === 'active' ? 'ghost' : 'ghost'}
                onClick={() => setActiveTab('active')}
                className={`rounded-none border-b-2 ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                Active Orders
                </Button>
                <Button
                variant={activeTab === 'history' ? 'ghost' : 'ghost'}
                onClick={() => setActiveTab('history')}
                className={`rounded-none border-b-2 ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                Order History
                </Button>
            </div>
            <div>
                {orders[activeTab].map((order) => (
                <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </CardContent>
    </Card>
  );
};

export default OrderManagement;
