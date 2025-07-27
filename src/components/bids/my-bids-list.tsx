
'use client';
import { useMemo } from 'react';
import { collectionGroup, query, where, orderBy } from 'firebase/firestore';
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
        if (!user) return null;
        return query(
            collectionGroup(db, 'proposals'), 
            where("supplierId", "==", user.uid),
            orderBy("createdAt", "desc")
        );
    }, [user]);

    const [proposals, loading, error] = useCollectionData(proposalsQuery, { idField: 'id' });

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
                                        <AlertDescription>{error.message}</AlertDescription>
                                    </Alert>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && proposals && proposals.length > 0 ? (
                            proposals.map(proposalData => {
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
                            !loading && (
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
