'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
        { status: 'Quality Check', time: 'Current', completed: false },
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
        { status: 'Shipped', time: 'Current', completed: false },
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
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700';
    case 'Shipped':
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700';
    case 'Delivered':
      return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const OrderCard = ({ order }: { order: any }) => (
  <Card className="bg-white dark:bg-gray-800 shadow-md mb-4">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">
            Order {order.id} <span className="text-gray-500 dark:text-gray-400">•</span> {order.supplier}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {order.amount} • {order.date}
          </p>
        </div>
        <Badge variant="outline" className={getStatusClass(order.status)}>{order.status}</Badge>
      </div>
      {order.timeline && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Order Timeline:</p>
          <div className="flex flex-col space-y-2 text-xs">
            {order.timeline.map((item: any, index: number) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${item.completed ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <span className={`font-medium ${item.completed ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.status}
                </span>
                <span className="ml-auto text-gray-500 dark:text-gray-400">{item.time}</span>
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
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Order Management</h3>
      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeTab === 'active' ? 'secondary' : 'ghost'}
          onClick={() => setActiveTab('active')}
          className="rounded-full"
        >
          Active Orders
        </Button>
        <Button
          variant={activeTab === 'history' ? 'secondary' : 'ghost'}
          onClick={() => setActiveTab('history')}
           className="rounded-full"
        >
          Order History
        </Button>
      </div>
      <div>
        {orders[activeTab].map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
