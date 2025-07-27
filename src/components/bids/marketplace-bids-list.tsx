
'use client';

import { useState, useMemo, FormEvent } from 'react';
import { collection, addDoc, serverTimestamp, query, where, orderBy, doc, updateDoc, getDoc, deleteDoc, limit } from 'firebase/firestore';
import { useCollection, useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Bid, Proposal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gavel, Loader2, Plus, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { FirebaseError } from 'firebase/app';

function CreateBidDialog() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [item, setItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [targetPrice, setTargetPrice] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !item || !quantity || !targetPrice) {
            toast({ variant: 'destructive', title: 'Missing Information' });
            return;
        }
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'bids'), {
                vendorId: user.uid,
                vendorName: user.businessName,
                item,
                quantity: Number(quantity),
                targetPrice: Number(targetPrice),
                status: 'open',
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Requirement Posted!', description: 'Your bid is now live on the marketplace.' });
            setIsOpen(false);
            setItem(''); setQuantity(''); setTargetPrice('');
        } catch (error) {
            console.error(error);
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

function ProposalsList({ bid }: { bid: Bid }) {
    const proposalsCollection = useMemo(() => collection(db, 'bids', bid.id, 'proposals'), [bid.id]);
    const proposalsQuery = useMemo(() => query(proposalsCollection, orderBy('createdAt', 'desc')), [proposalsCollection]);
    const [proposalsSnapshot, loading, error] = useCollection(proposalsQuery);
    const { toast } = useToast();

    const handleAcceptProposal = async (proposalId: string) => {
        try {
            // In a real-world app, this should be a transaction to ensure atomicity.
            const bidRef = doc(db, 'bids', bid.id);
            const proposalRef = doc(db, 'bids', bid.id, 'proposals', proposalId);

            await updateDoc(bidRef, { status: 'closed', acceptedProposalId: proposalId });
            await updateDoc(proposalRef, { status: 'accepted' });

            toast({ title: 'Proposal Accepted!', description: 'The supplier has been notified.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not accept the proposal.' });
        }
    };

    if (loading) return <Skeleton className="h-20 w-full" />;
    if (error) return <Alert variant="destructive"><AlertTriangle className="mr-2" />{error.message}</Alert>;

    const proposals = proposalsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal)) || [];

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
                    {bid.status === 'open' ? (
                        <Button size="sm" onClick={() => handleAcceptProposal(p.id)} disabled={p.status === 'accepted'}>
                            {p.status === 'accepted' ? <CheckCircle className="mr-2" /> : null}
                            {p.status === 'accepted' ? 'Accepted' : 'Accept'}
                        </Button>
                    ) : (
                        <Badge variant={p.id === bid.acceptedProposalId ? 'success' : 'secondary'}>
                            {p.id === bid.acceptedProposalId ? 'Accepted' : 'Not Selected'}
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
    const { toast } = useToast();
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showProposals, setShowProposals] = useState(false);

    const isVendorOwner = user?.uid === bid.vendorId;

    const proposalsCollection = useMemo(() => collection(db, 'bids', bid.id, 'proposals'), [bid.id]);
    const userProposalQuery = useMemo(() => {
        if (!user || user.role !== 'supplier') return null;
        return query(proposalsCollection, where('supplierId', '==', user.uid), limit(1));
    }, [proposalsCollection, user]);

    const [userProposals, loadingUserProposals] = useCollectionData(userProposalQuery);
    const hasUserBid = !loadingUserProposals && userProposals && userProposals.length > 0;

    const handleBidSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || user.role !== 'supplier' || !price) {
            toast({ variant: "destructive", title: "Bid Error", description: "Price cannot be empty."});
            return;
        }
        setIsSubmitting(true);
        try {
            const proposalData = {
                supplierId: user.uid,
                supplierName: user.businessName,
                price: Number(price),
                status: 'pending',
                createdAt: serverTimestamp(),
            };
            await addDoc(proposalsCollection, proposalData);
            toast({ title: 'Offer Submitted!', description: `Your bid for ${bid.item} has been placed.` });
            setPrice('');
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit your offer.' });
        } finally {
            setIsSubmitting(false);
             toast({ title: 'Offer Submitted!', description: `Your bid for ${bid.item} has been placed.` }); // Show confirmation alert after submission
        }
    };

    const handleDeleteBid = async () => {
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'bids', bid.id));
            toast({ title: 'Bid Deleted', description: 'Your requirement has been removed from the marketplace.' });
        } catch (error) {
            const isPermissionError = error instanceof FirebaseError && (error.code === 'permission-denied' || error.code === 'unauthenticated');
            console.error(error);
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: isPermissionError
                    ? "You do not have permission to delete this bid. Please check Firestore rules."
                    : 'Could not delete the bid.' 
            });
        } finally {
            setIsDeleting(false);
        }
    };
    
    const showBidForm = user?.role === 'supplier' && bid.status === 'open' && !hasUserBid;

    return (
        <Card className="flex flex-col bg-glass">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{bid.item}</CardTitle>
                        <CardDescription>
                            by {bid.vendorName} &bull; {bid.createdAt ? formatDistanceToNow(bid.createdAt.toDate(), { addSuffix: true }) : 'just now'}
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
                {showBidForm && (
                    <form onSubmit={handleBidSubmit} className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Your Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={isSubmitting || loadingUserProposals}>
                            {isSubmitting || loadingUserProposals ? <Loader2 className="animate-spin" /> : 'Submit Offer'}
                        </Button>
                    </form>
                )}
                {user?.role === 'supplier' && hasUserBid && (
                     <Alert variant="success" className="text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Offer Submitted</AlertTitle>
                        <AlertDescription>You have already placed an offer on this item.</AlertDescription>
                    </Alert>
                )}
                {isVendorOwner && (
                    <>
                        <Button variant="outline" onClick={() => setShowProposals(!showProposals)}>
                            {showProposals ? 'Hide Proposals' : 'View Proposals'}
                        </Button>
                        {showProposals && <ProposalsList bid={bid} />}
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
    const proposalRef = useMemo(() => {
        if (!bid.acceptedProposalId) return null;
        return doc(db, 'bids', bid.id, 'proposals', bid.acceptedProposalId);
    }, [bid]);
    
    const [proposal, loading, error] = useDocumentData(proposalRef);

    if (loading) return <Skeleton className="h-10 w-full" />;
    if (error || !proposal) return null;
    
    return (
        <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Proposal Accepted</AlertTitle>
            <AlertDescription>
                Accepted from <strong>{proposal.supplierName}</strong> at <strong>${(proposal.price as number).toFixed(2)}</strong>.
            </AlertDescription>
        </Alert>
    );
}

export function MarketplaceBidsList() {
    const { user } = useAuth();
    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const bidsQuery = useMemo(() => query(bidsCollection, orderBy('createdAt', 'desc')), [bidsCollection]);
    const [bidsSnapshot, loading, error] = useCollection(bidsQuery);

    const bids = bidsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bid)) || [];

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

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
                </div>
            )}
            {error && <Alert variant="destructive"><AlertTriangle className="mr-2" />{error.message}</Alert>}
            {!loading && bids.length === 0 && (
                <Card className="bg-glass">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No active requirements in the marketplace.
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bids.map(bid => (
                    <BidCard key={bid.id} bid={bid} />
                ))}
            </div>
        </div>
    );
}

    