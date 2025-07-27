
'use client';
import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useBidding } from '@/hooks/use-bidding';
import type { Proposal } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { List } from 'lucide-react';
import { format } from 'date-fns';

export function MyBidsList() {
    const { user } = useAuth();
    const { proposals, loading } = useBidding();

    const myProposals = useMemo(() => {
        if (!user || !proposals) return [];
        return proposals
            .filter(p => p.supplierId === user.uid)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [proposals, user]);

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
                        
                        {!loading && myProposals.length > 0 ? (
                            myProposals.map(proposal => (
                                <TableRow key={proposal.id}>
                                    <TableCell className="font-bold">${proposal.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {format(new Date(proposal.createdAt), 'PPP')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={proposal.status === 'accepted' ? 'success' : 'secondary'} className="capitalize">
                                            {proposal.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
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
