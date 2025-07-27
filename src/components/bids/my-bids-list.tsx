
'use client';
import { useMemo } from 'react';
import { collectionGroup, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Proposal } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, List } from 'lucide-react';
import { format } from 'date-fns';

export function MyBidsList() {
    const { user } = useAuth();

    const proposalsQuery = useMemo(() => {
        if (!user || user.role !== 'supplier') return null;
        // Simplified query to make it less dependent on complex indexes.
        // Sorting will be handled on the client-side.
        return query(
            collectionGroup(db, 'proposals'), 
            where("supplierId", "==", user.uid)
        );
    }, [user]);

    const [proposals, loading, error] = useCollectionData(proposalsQuery, { idField: 'id' });

    // Client-side sorting
    const sortedProposals = useMemo(() => {
        if (!proposals) return [];
        return [...proposals].sort((a, b) => {
            const dateA = (a.createdAt as Timestamp)?.toDate() || 0;
            const dateB = (b.createdAt as Timestamp)?.toDate() || 0;
            if (!dateA || !dateB) return 0;
            return dateB.getTime() - dateA.getTime();
        });
    }, [proposals]);

    return (
        <Card className="glassmorphic mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <List /> My Submitted Bids
                </CardTitle>
                <CardDescription>A list of all the proposals you have submitted.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Price</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            </TableRow>
                        ))}
                        {error && (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Error Loading Your Bids</AlertTitle>
                                        <AlertDescription>
                                            There was a problem fetching your bids. The most common cause is a missing Firestore index or a permissions issue in your security rules. Please ensure they are configured correctly.
                                            <pre className="mt-2 p-2 bg-muted rounded-md text-xs whitespace-pre-wrap">{error.message}</pre>
                                        </AlertDescription>
                                    </Alert>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && sortedProposals && sortedProposals.length > 0 ? (
                            sortedProposals.map(proposalData => {
                                const proposal = proposalData as Proposal;
                                return (
                                    <TableRow key={proposal.id}>
                                        <TableCell className="font-bold">${proposal.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            {proposal.createdAt ? format(proposal.createdAt.toDate(), 'PPP') : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={proposal.status === 'accepted' ? 'success' : 'secondary'} className="capitalize">
                                                {proposal.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            !loading && !error && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
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
