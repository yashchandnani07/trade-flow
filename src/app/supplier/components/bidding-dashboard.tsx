'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BiddingDashboard = () => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-white">Bidding Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">Active Bids</h4>
          <Card className="bg-gray-50 dark:bg-gray-700/50 p-4">
            <p className="font-medium text-gray-800 dark:text-white">Requirement: 200kg Chicken (Pune Market)</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your Bid: <span className="font-bold text-green-600 dark:text-green-400">₹8,500 (Leading)</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Time remaining: 3h 12m</p>
            </div>
          </Card>
        </div>
        <div className="mt-6 space-y-4">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">Won Bids</h4>
          <Card className="bg-gray-50 dark:bg-gray-700/50 p-4">
             <div className="flex justify-between items-center">
               <div>
                  <p className="font-medium text-gray-800 dark:text-white">150kg Tomatoes (Mumbai Market)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Your Bid: ₹4,200</p>
               </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">Won</Badge>
             </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiddingDashboard;
