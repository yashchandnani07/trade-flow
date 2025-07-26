
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gavel, AlertTriangle, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import type { Bid } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';

const BidCard = ({ bid }: { bid: Bid }) => {
    const createdAt = bid.createdAt?.toDate ? formatDistanceToNow(bid.createdAt.toDate(), { addSuffix: true }) : 'just now';
    return (
        <Card className="bg-secondary/50 p-4">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                    <p className="font-semibold text-lg">{bid.item}</p>
                    <p className="text-sm text-muted-foreground">
                        {bid.quantity} kg required by {bid.vendorName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Target Price: <span className="font-medium text-foreground">₹{bid.targetPrice.toLocaleString()}</span>
                    </p>
                </div>
                <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end gap-2">
                     <p className="text-xs text-muted-foreground">{createdAt}</p>
                    <Button size="sm">Place Bid</Button>
                </div>
            </div>
        </Card>
    )
};


const BiddingDashboard = () => {
    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const bidsQuery = useMemo(() => query(bidsCollection, where("status", "==", "active"), orderBy("createdAt", "desc")), [bidsCollection]);
    const [bids, loading, error] = useCollectionData(bidsQuery, { idField: 'id' });

    return (
        <Card className="bg-glass">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Bidding Dashboard</CardTitle>
                <CardDescription>Active requirements from vendors</CardDescription>
            </div>
            <Gavel className="w-6 h-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Bids</AlertTitle>
                    <AlertDescription>
                        Could not load active bids. Please try again later.
                        <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                    </AlertDescription>
                </Alert>
            )}
            {!loading && !error && (!bids || bids.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                    <p>No active bidding requirements at the moment.</p>
                </div>
            )}
            {!loading && bids && bids.map(bid => (
                <BidCard key={bid.id} bid={bid as Bid} />
            ))}
            </div>
        </CardContent>
        </Card>
    );
};

export default BiddingDashboard;
