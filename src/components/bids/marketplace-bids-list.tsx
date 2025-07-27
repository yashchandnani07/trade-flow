
'use client';

import { useState, FormEvent, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useBidding } from '@/hooks/use-bidding';
import type { Bid, Proposal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gavel, Loader2, Plus, AlertTriangle, CheckCircle, Trash2, Handshake, MessageSquareQuote } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';


function CreateBidDialog() {
    const { addBid, isAddingBid } = useBidding();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [item, setItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [targetPrice, setTargetPrice] = useState('');

    const handleSubmit = async (e: FormEvent) => {
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

function BidCard({ bid }: { bid: Bid }) {
    const { user } = useAuth();
    const { addProposal, isAddingProposal, getProposalsForBid } = useBidding();
    const { toast } = useToast();
    const [price, setPrice] = useState('');
    const [showNegotiateForm, setShowNegotiateForm] = useState(false);

    const proposals = getProposalsForBid(bid.id);
    const userProposal = useMemo(() => {
        return proposals.find(p => p.supplierId === user?.uid);
    }, [proposals, user?.uid]);

    const submitOffer = async (offerPrice: number) => {
        try {
            await addProposal(bid.id, { price: offerPrice });
            toast({ title: 'Offer Submitted!', description: `Your proposal for ${bid.item} has been placed.` });
            setPrice('');
            setShowNegotiateForm(false);
        } catch (error) {
            // Error toast handled in hook
        }
    };

    const handleNegotiateSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!price || Number(price) <= 0) {
            toast({ variant: "destructive", title: "Input Error", description: "Please enter a valid price to negotiate." });
            return;
        }
        submitOffer(Number(price));
    };

    const handleAccept = () => {
        submitOffer(bid.targetPrice);
    };
    
    const showBidActions = user?.role === 'supplier' && bid.status === 'open';
    const createdAtDate = useMemo(() => {
        if (!bid.createdAt) return new Date();
        return (bid.createdAt as Timestamp).toDate();
    }, [bid.createdAt]);

    return (
        <Card className={cn(
            "flex flex-col bg-glass/80 backdrop-blur-lg group",
            "border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
        )}>
             <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/5 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{bid.item}</CardTitle>
                        <CardDescription>
                            by {bid.vendorName} &bull; {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                        </CardDescription>
                    </div>
                    <Badge variant={bid.status === 'open' ? 'success' : 'secondary'} className="capitalize">{bid.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                    <p><strong>Quantity:</strong> {bid.quantity} units</p>
                    <p><strong>Target Price:</strong> ${bid.targetPrice.toFixed(2)}</p>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-4">
                {showBidActions && !userProposal && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={handleAccept} disabled={isAddingProposal}>
                                <Handshake className="mr-2 h-4 w-4" /> Accept
                            </Button>
                            <Button variant="secondary" onClick={() => setShowNegotiateForm(!showNegotiateForm)}>
                                <MessageSquareQuote className="mr-2 h-4 w-4" /> Negotiate
                            </Button>
                        </div>
                        {showNegotiateForm && (
                             <form onSubmit={handleNegotiateSubmit} className="flex gap-2 pt-2">
                                <Input
                                    type="number"
                                    placeholder="Your Price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    step="0.01"
                                />
                                <Button type="submit" disabled={isAddingProposal}>
                                    {isAddingProposal ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
                                </Button>
                            </form>
                        )}
                    </div>
                )}
                {showBidActions && userProposal && (
                     <Alert variant="success" className="text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Offer Submitted</AlertTitle>
                        <AlertDescription>You proposed ${userProposal.price.toFixed(2)} for this item.</AlertDescription>
                    </Alert>
                )}
            </CardFooter>
        </Card>
    );
}

export function MarketplaceBidsList() {
    const { bids, loading, error } = useBidding();
    const openBids = useMemo(() => bids.filter(b => b.status === 'open'), [bids]);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Gavel /> Marketplace Requirements</h2>
                    <p className="text-muted-foreground">
                       Find active requirements from vendors and place your proposals.
                    </p>
                </div>
            </div>
             {error && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Requirements</AlertTitle>
                    <AlertDescription>
                        There was a problem fetching requirements from the database. Please check your connection and Firestore security rules.
                         <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                    </AlertDescription>
                </Alert>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={`bid-skeleton-${i}`} className="h-64" />)}
                </div>
            )}

            {!loading && openBids.length === 0 && !error && (
                <Card className="bg-glass">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No active requirements found in the marketplace.
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!loading && openBids.map(bid => {
                    if (!bid?.id) return null;
                    return <BidCard key={bid.id} bid={bid} />;
                })}
            </div>
        </div>
    );
}
