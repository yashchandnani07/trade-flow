
'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useBidding } from '@/hooks/use-bidding';
import type { Bid } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle, Trash2, ListChecks, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import React from 'react';


function AcceptedProposalInfo({ bid }: { bid: Bid }) {
    const { getProposalsForBid } = useBidding();
    const acceptedProposal = getProposalsForBid(bid.id).find(p => p.id === bid.acceptedProposalId);

    if (!acceptedProposal) return null;
    
    return (
        <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Proposal Accepted</AlertTitle>
            <AlertDescription>
                Accepted from <strong>{acceptedProposal.supplierName}</strong> at <strong>${(acceptedProposal.price as number).toFixed(2)}</strong>. An order has been created.
            </AlertDescription>
        </Alert>
    );
}

function ProposalsList({ bidId }: { bidId: string}) {
    const { acceptProposal, bids, getProposalsForBid, isAcceptingProposal } = useBidding();
    const { toast } = useToast();
    const bid = bids.find(b => b.id === bidId);
    const proposals = getProposalsForBid(bidId);
    
    const [acceptingId, setAcceptingId] = useState<string | null>(null);

    const handleAcceptProposal = async (proposalId: string) => {
        setAcceptingId(proposalId);
        try {
            await acceptProposal(bidId, proposalId);
            toast({ title: 'Proposal Accepted!', description: 'The supplier has been notified and an order has been created.' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not accept proposal.' });
        } finally {
            setAcceptingId(null);
        }
    };

    if (proposals.length === 0) {
        return <p className="text-sm text-center text-muted-foreground py-4">No proposals yet.</p>;
    }

    return (
        <div className="space-y-2">
            {proposals.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div>
                        <p className="font-semibold">{p.supplierName}</p>
                        <p className="text-lg font-bold text-primary">${p.price.toFixed(2)}</p>
                    </div>
                    {bid?.status === 'open' ? (
                        <Button size="sm" onClick={() => handleAcceptProposal(p.id)} disabled={isAcceptingProposal}>
                            {isAcceptingProposal && acceptingId === p.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Accept
                        </Button>
                    ) : (
                        <Badge variant={p.id === bid?.acceptedProposalId ? 'success' : 'secondary'}>
                            {p.id === bid?.acceptedProposalId ? 'Accepted' : 'Not Selected'}
                        </Badge>
                    )}
                </div>
            ))}
        </div>
    );
}

function RequirementCard({ bid }: { bid: Bid }) {
    const { deleteBid, isDeletingBid, getProposalsForBid } = useBidding();
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<string|null>(null);
    const [showProposals, setShowProposals] = useState(false);
   
    const allProposals = getProposalsForBid(bid.id);
    
    const handleDeleteBid = async () => {
        setDeletingId(bid.id);
        try {
            await deleteBid(bid.id);
            toast({ title: 'Requirement Deleted', description: 'Your requirement has been removed from the marketplace.' });
        } catch (error) {
            console.log(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the requirement.' });
        } finally {
             setDeletingId(null);
        }
    };
    
    const createdAtDate = useMemo(() => {
        if (!bid.createdAt) return new Date();
        return (bid.createdAt as Timestamp).toDate()
    }, [bid.createdAt]);

    return (
        <Card className="flex flex-col bg-glass">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{bid.item}</CardTitle>
                        <CardDescription>
                           Posted {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Badge variant={bid.status === 'open' ? 'success' : 'secondary'} className="capitalize">{bid.status}</Badge>
                        {bid.status === 'open' && (
                        <Button variant="ghost" size="icon" className="text-destructive h-6 w-6" disabled={isDeletingBid && deletingId === bid.id} onClick={handleDeleteBid}>
                           {isDeletingBid && deletingId === bid.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                    <p><strong>Quantity:</strong> {bid.quantity} units</p>
                    <p><strong>Target Price:</strong> ${bid.targetPrice.toFixed(2)}</p>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-4">
                <Button variant="outline" onClick={() => setShowProposals(!showProposals)}>
                    {showProposals ? 'Hide Proposals' : `View Proposals (${allProposals.length})`}
                </Button>
                {showProposals && <ProposalsList bidId={bid.id} />}
                 {bid.status === 'closed' && bid.acceptedProposalId && (
                    <AcceptedProposalInfo bid={bid} />
                )}
            </CardFooter>
        </Card>
    );
}

function CreateRequirementDialog() {
    const { addBid, isAddingBid } = useBidding();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [item, setItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [targetPrice, setTargetPrice] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item || !quantity || !targetPrice) {
            toast({ variant: 'destructive', title: 'Missing Information' });
            return;
        }
        
        try {
            await addBid({
                item,
                quantity: Number(quantity),
                targetPrice: Number(targetPrice),
            });
            toast({ title: 'Requirement Posted!', description: 'Your requirement is now live on the marketplace.' });
            setIsOpen(false);
            setItem(''); setQuantity(''); setTargetPrice('');
        } catch (error) {
             // Error toast is handled in the hook
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Post New Requirement
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-glass">
                <DialogHeader>
                    <DialogTitle>Post a New Requirement</DialogTitle>
                    <DialogDescription>Detail the item you need and your target price.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="item">Item Name</Label>
                            <Input id="item" value={item} onChange={(e) => setItem(e.target.value)} required placeholder="e.g. Fresh Tomatoes"/>
                        </div>
                        <div>
                            <Label htmlFor="quantity">Quantity (in kg, units, etc.)</Label>
                            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required placeholder="e.g. 100"/>
                        </div>
                        <div>
                            <Label htmlFor="targetPrice">Target Price ($ per unit)</Label>
                            <Input id="targetPrice" type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} required placeholder="e.g. 2.50"/>
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isAddingBid}>
                            {isAddingBid && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Requirement
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export function MyRequirementsList() {
    const { user } = useAuth();
    const { bids, loading, error } = useBidding();

    const myBids = useMemo(() => {
        if (!user || !bids) return [];
        return bids
            .filter(b => b.vendorId === user.uid)
            .sort((a, b) => {
                const dateA = a.createdAt ? (a.createdAt as Timestamp).toDate() : new Date();
                const dateB = b.createdAt ? (b.createdAt as Timestamp).toDate() : new Date();
                return dateB.getTime() - dateA.getTime();
            });
    }, [bids, user]);
    

    return (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><ListChecks /> My Requirements</h2>
                    <p className="text-muted-foreground">
                        A list of all the requirements you have posted on the marketplace.
                    </p>
                </div>
                 <CreateRequirementDialog />
            </div>
             {error && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Requirements</AlertTitle>
                    <AlertDescription>
                        There was a problem fetching your requirements.
                         <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                    </AlertDescription>
                </Alert>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
                </div>
            )}

            {!loading && myBids.length === 0 && !error && (
                <Card className="bg-glass">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        You have not posted any requirements yet.
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!loading && myBids.map(bid => {
                    if (!bid?.id) return null;
                    return <RequirementCard key={bid.id} bid={bid} />;
                })}
            </div>
        </div>
    );
}
