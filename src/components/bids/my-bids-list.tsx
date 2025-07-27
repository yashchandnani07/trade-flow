
'use client';
import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { List, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Timestamp, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import type { Proposal, Bid } from '@/lib/types';


export function MyBidsList() {
    const { user } = useAuth();

    const proposalsCollection = useMemo(() => collection(db, 'proposals'), []);
    const myProposalsQuery = useMemo(() => {
        if (!user) return null;
        return query(proposalsCollection, where('supplierId', '==', user.uid), orderBy('createdAt', 'desc'));
    }, [proposalsCollection, user]);
    
    const [myProposalsSnapshot, loading, error] = useCollection(myProposalsQuery);

    const bidIds = useMemo(() => {
        if (!myProposalsSnapshot) return [];
        const ids = myProposalsSnapshot.docs.map(doc => doc.data().bidId);
        // Firestore 'in' query can take at most 30 arguments
        return [...new Set(ids)].slice(0, 30);
    }, [myProposalsSnapshot]);

    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const bidsQuery = useMemo(() => {
        if (bidIds.length === 0) return null;
        return query(bidsCollection, where('__name__', 'in', bidIds));
    }, [bidsCollection, bidIds]);

    const [bids] = useCollectionData(bidsQuery, { idField: 'id' });

    const myProposalsWithBids = useMemo(() => {
        if (!myProposalsSnapshot || !bids) return [];
        return myProposalsSnapshot.docs.map(doc => {
            const proposal = { id: doc.id, ...doc.data() } as Proposal;
            const bid = (bids as Bid[]).find(b => b.id === proposal.bidId);
            return { ...proposal, bid };
        });
    }, [myProposalsSnapshot, bids]);

    return (
        <Card className="glassmorphic mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <List /> My Submitted Proposals
                </CardTitle>
                <CardDescription>A list of all the proposals you have submitted.</CardDescription>
            </CardHeader>
            <CardContent>
                 {error && (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Your Proposals</AlertTitle>
                        <AlertDescription>
                            There was a problem fetching your proposals.
                             <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                        </AlertDescription>
                    </Alert>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Your Price</TableHead>
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
                        
                        {!loading && myProposalsWithBids.length > 0 ? (
                            myProposalsWithBids.map((proposal) => {
                                const bid = proposal.bid;
                                if (!bid) return null;
                                const createdAtDate = proposal.createdAt ? (proposal.createdAt as Timestamp).toDate() : new Date();
                                
                                let status: 'Pending' | 'Accepted' | 'Not Accepted' = 'Pending';
                                let variant: 'secondary' | 'success' | 'destructive' = 'secondary';

                                if (bid.status === 'closed') {
                                    if (bid.acceptedProposalId === proposal.id) {
                                        status = 'Accepted';
                                        variant = 'success';
                                    } else {
                                        status = 'Not Accepted';
                                        variant = 'destructive';
                                    }
                                }

                                return (
                                <TableRow key={proposal.id}>
                                    <TableCell className="font-medium">{bid.item}</TableCell>
                                    <TableCell className="font-bold">${proposal.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {format(createdAtDate, 'PPP')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={variant} className="capitalize">
                                            {status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                )
                            })
                        ) : (
                            !loading && !error && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        You haven't submitted any proposals yet.
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
