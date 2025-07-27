
'use client';
import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useBidding } from '@/hooks/use-bidding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { List, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Timestamp } from 'firebase/firestore';


export function MyBidsList() {
    const { user } = useAuth();
    const { myBids, loading, error } = useBidding();

    return (
        <Card className="glassmorphic mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <List /> My Submitted Bids
                </CardTitle>
                <CardDescription>A list of all the bids you have submitted.</CardDescription>
            </CardHeader>
            <CardContent>
                 {error && (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Your Bids</AlertTitle>
                        <AlertDescription>
                            There was a problem fetching your bids.
                             <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                        </AlertDescription>
                    </Alert>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Your Bid</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && [...Array(3)].map((_, i) => (
                            <TableRow key={`my-bids-skeleton-${i}`}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            </TableRow>
                        ))}
                        
                        {!loading && myBids.length > 0 ? (
                            myBids.map((bid) => {
                                const createdAtDate = bid.timestamp ? (bid.timestamp as Timestamp).toDate() : new Date();
                                const uniqueKey = bid.id || `${bid.itemId}-${createdAtDate.getTime()}`;
                                return (
                                <TableRow key={uniqueKey}>
                                    <TableCell className="font-medium">{bid.itemName}</TableCell>
                                    <TableCell className="font-bold">${bid.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {format(createdAtDate, 'PPP')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={bid.status === 'accepted' ? 'success' : 'secondary'} className="capitalize">
                                            {bid.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                )
                            })
                        ) : (
                            !loading && !error && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        You haven't submitted any bids yet.
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
