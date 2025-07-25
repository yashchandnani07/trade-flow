'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const BiddingDashboard = () => {
  return (
    <Card className="bg-card-gradient">
      <CardHeader>
        <CardTitle>Bidding Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h4 className="font-semibold text-muted-foreground">Active Bids</h4>
          <Card className="bg-secondary p-4">
            <p className="font-medium">Requirement: 200kg Chicken (Pune Market)</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm">
                Your Bid: <span className="font-bold text-green-400">₹8,500 (Leading)</span>
              </p>
              <p className="text-sm text-muted-foreground">Time remaining: 3h 12m</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2">View Bid</Button>
          </Card>
        </div>
        <div className="mt-6 space-y-4">
          <h4 className="font-semibold text-muted-foreground">Won Bids</h4>
          <Card className="bg-secondary p-4">
             <div className="flex justify-between items-center">
               <div>
                  <p className="font-medium">150kg Tomatoes (Mumbai Market)</p>
                  <p className="text-sm text-muted-foreground">Your Bid: ₹4,200</p>
               </div>
                <Badge variant="outline" className="text-green-400 border-green-400/50">Won</Badge>
             </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiddingDashboard;
