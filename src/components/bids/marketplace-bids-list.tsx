
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


function CreateBidDialog() {
    const { addBid } = useBidding();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [item, setItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [targetPrice, setTargetPrice] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!item || !quantity || !targetPrice) {
            toast({ variant: 'destructive', title: 'Missing Information' });
            return;
        }
        setIsSubmitting(true);
        try {
            await addBid({
                item,
                quantity: Number(quantity),
                targetPrice: Number(targetPrice),
            });
            toast({ title: 'Requirement Posted!', description: 'Your bid is now live on the marketplace.' });
            setIsOpen(false);
            setItem(''); setQuantity(''); setTargetPrice('');
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not post your requirement.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2" /> Post New Requirement
                </Button>
            </DialogTrigger>
            <DialogContent>
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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                            Post Requirement
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ProposalsList({ bidId }: { bidId: string}) {
    const { acceptProposal, bids, getProposalsForBid } = useBidding();
    const { toast } = useToast();
    const bid = bids.find(b => b.id === bidId);
    const proposals = getProposalsForBid(bidId);
    
    const [isAccepting, setIsAccepting] = useState<string | null>(null);

    const handleAcceptProposal = async (proposalId: string) => {
        setIsAccepting(proposalId);
        try {
            await acceptProposal(bidId, proposalId);
            toast({ title: 'Proposal Accepted!', description: 'The supplier has been notified.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not accept proposal.' });
        } finally {
            setIsAccepting(null);
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
                        <Button size="sm" onClick={() => handleAcceptProposal(p.id)} disabled={isAccepting === p.id}>
                            {isAccepting === p.id ? <Loader2 className="mr-2 animate-spin" /> : null}
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

function DeleteBidDialog({ bid, onConfirm, isDeleting }: { bid: Bid, onConfirm: () => void, isDeleting: boolean }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive h-6 w-6">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-glass">
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your requirement for <span className="font-bold">{bid.item}</span> from the marketplace.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="button" onClick={onConfirm} disabled={isDeleting} variant="destructive">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function BidCard({ bid }: { bid: Bid }) {
    const { user } = useAuth();
    const { addProposal, deleteBid, getProposalsForBid } = useBidding();
    const { toast } = useToast();
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showProposals, setShowProposals] = useState(false);
    const [showNegotiateForm, setShowNegotiateForm] = useState(false);

    const isVendorOwner = user?.uid === bid.vendorId;

    const allProposals = getProposalsForBid(bid.id);
    const userProposal = useMemo(() => {
        return allProposals.find(p => p.supplierId === user?.uid);
    }, [allProposals, user?.uid]);

    const submitOffer = async (offerPrice: number) => {
        setIsSubmitting(true);
        try {
            await addProposal(bid.id, { price: offerPrice });
            toast({ title: 'Offer Submitted!', description: `Your bid for ${bid.item} has been placed.` });
            setPrice('');
            setShowNegotiateForm(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit your offer.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNegotiateSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!price) {
            toast({ variant: "destructive", title: "Input Error", description: "Please enter a price to negotiate." });
            return;
        }
        submitOffer(Number(price));
    };

    const handleAccept = () => {
        submitOffer(bid.targetPrice);
    };
    
    const handleDeleteBid = async () => {
        setIsDeleting(true);
        try {
            await deleteBid(bid.id);
            toast({ title: 'Bid Deleted', description: 'Your requirement has been removed from the marketplace.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the bid.' });
        } finally {
            setIsDeleting(false);
        }
    };
    
    const showBidActions = user?.role === 'supplier' && bid.status === 'open';
    const createdAtDate = bid.createdAt instanceof Timestamp ? bid.createdAt.toDate() : new Date();

    return (
        <Card className="flex flex-col bg-glass">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{bid.item}</CardTitle>
                        <CardDescription>
                            by {bid.vendorName} &bull; {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Badge variant={bid.status === 'open' ? 'success' : 'secondary'} className="capitalize">{bid.status}</Badge>
                         {isVendorOwner && (
                            <DeleteBidDialog bid={bid} onConfirm={handleDeleteBid} isDeleting={isDeleting} />
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
                {showBidActions && !userProposal && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={handleAccept} disabled={isSubmitting}>
                                <Handshake className="mr-2" /> Accept
                            </Button>
                            <Button variant="secondary" onClick={() => setShowNegotiateForm(!showNegotiateForm)}>
                                <MessageSquareQuote className="mr-2" /> Negotiate
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
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit'}
                                </Button>
                            </form>
                        )}
                    </div>
                )}
                {showBidActions && userProposal && (
                     <Alert variant="success" className="text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Offer Submitted</AlertTitle>
                        <AlertDescription>You have already placed an offer on this item.</AlertDescription>
                    </Alert>
                )}
                {isVendorOwner && (
                    <>
                        <Button variant="outline" onClick={() => setShowProposals(!showProposals)}>
                            {showProposals ? 'Hide Proposals' : `View Proposals (${allProposals.length})`}
                        </Button>
                        {showProposals && <ProposalsList bidId={bid.id} />}
                    </>
                )}
                 {bid.status === 'closed' && bid.acceptedProposalId && (
                    <AcceptedProposalInfo bid={bid} />
                )}
            </CardFooter>
        </Card>
    );
}

function AcceptedProposalInfo({ bid }: { bid: Bid }) {
    const { getProposalsForBid } = useBidding();
    const acceptedProposal = getProposalsForBid(bid.id).find(p => p.id === bid.acceptedProposalId);

    if (!acceptedProposal) return null;
    
    return (
        <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Proposal Accepted</AlertTitle>
            <AlertDescription>
                Accepted from <strong>{acceptedProposal.supplierName}</strong> at <strong>${(acceptedProposal.price as number).toFixed(2)}</strong>.
            </AlertDescription>
        </Alert>
    );
}

export function MarketplaceBidsList() {
    const { user } = useAuth();
    const { bids, loading, error } = useBidding();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Gavel /> Bidding Marketplace</h2>
                    <p className="text-muted-foreground">
                        {user?.role === 'vendor' ? 'Post requirements and receive offers from suppliers.' : 'Find requirements and place your offers.'}
                    </p>
                </div>
                {user?.role === 'vendor' && <CreateBidDialog />}
            </div>
             {error && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Bids</AlertTitle>
                    <AlertDescription>
                        There was a problem fetching bids from the database. Please check your connection and Firestore security rules.
                         <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                    </AlertDescription>
                </Alert>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={`bid-skeleton-${i}`} className="h-64" />)}
                </div>
            )}

            {!loading && bids && bids.length === 0 && !error && (
                <Card className="bg-glass">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No active requirements in the marketplace.
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!loading &&
                    bids &&
                    bids.map(bid => {
                        if (!bid || !bid.id) return null;
                        return <BidCard key={bid.id} bid={bid} />;
                    })}
            </div>
        </div>
    );
}
