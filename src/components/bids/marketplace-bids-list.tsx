
'use client';

import { useState, FormEvent, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
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
import { Timestamp, collection, addDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { cn } from '@/lib/utils';
import { FirebaseError } from 'firebase/app';

function BidCard({ bid }: { bid: Bid }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [price, setPrice] = useState('');
    const [showNegotiateForm, setShowNegotiateForm] = useState(false);
    const [isAddingProposal, setIsAddingProposal] = useState(false);
    
    const proposalsCollection = useMemo(() => collection(db, 'proposals'), []);
    const userProposalQuery = useMemo(() => {
        if (!user) return null;
        return query(proposalsCollection, where('bidId', '==', bid.id), where('supplierId', '==', user.uid));
    }, [proposalsCollection, bid.id, user]);

    const [userProposals] = useCollectionData(userProposalQuery);
    const userProposal = useMemo(() => userProposals?.[0] as Proposal, [userProposals]);

    const submitOffer = async (offerPrice: number) => {
        if (!user || user.role !== 'supplier') {
            toast({ variant: 'destructive', title: 'Action not allowed' });
            return;
        }
        setIsAddingProposal(true);
        try {
            await addDoc(collection(db, 'proposals'), {
                bidId: bid.id,
                supplierId: user.uid,
                supplierName: user.businessName,
                price: offerPrice,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Offer Submitted!', description: `Your proposal for ${bid.item} has been placed.` });
            setPrice('');
            setShowNegotiateForm(false);
        } catch (error) {
            console.error('Error adding proposal:', error);
            toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not submit your proposal.' });
        } finally {
            setIsAddingProposal(false);
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
    
    const showBidActions = user?.role === 'supplier' && bid.status === 'open' && bid.vendorId !== user?.uid;
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
                 {user?.role === 'vendor' && bid.vendorId === user?.uid && (
                     <Alert variant="default" className="text-sm">
                        <AlertTitle>This is your requirement</AlertTitle>
                        <AlertDescription>You can manage proposals in your dashboard.</AlertDescription>
                    </Alert>
                )}
            </CardFooter>
        </Card>
    );
}

export function MarketplaceBidsList() {
    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const openBidsQuery = useMemo(() => query(bidsCollection, where('status', '==', 'open'), orderBy('createdAt', 'desc')), [bidsCollection]);
    const [bids, loading, error] = useCollectionData(openBidsQuery, { idField: 'id' });
    
    // Check for specific Firestore error for missing index
    const isIndexError = error instanceof FirebaseError && error.code === 'failed-precondition';
    const indexCreationLink = isIndexError ? (error.message.match(/https?:\/\/[^\s]+/) || [])[0] : '';
    
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
             {isIndexError && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Database Index Required</AlertTitle>
                    <AlertDescription>
                        To display marketplace requirements, a Firestore index is needed. Please create it by clicking the link below, then refresh the page.
                        <a href={indexCreationLink} target="_blank" rel="noopener noreferrer" className="block w-full text-center mt-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Create Firestore Index
                        </a>
                         <pre className="mt-2 p-2 bg-muted rounded-md text-xs whitespace-pre-wrap">{error.message}</pre>
                    </AlertDescription>
                </Alert>
            )}
             {error && !isIndexError && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Requirements</AlertTitle>
                    <AlertDescription>
                        There was a problem fetching requirements from the database. Please check your connection and try again.
                         <pre className="mt-2 p-2 bg-muted rounded-md text-xs whitespace-pre-wrap">{error.message}</pre>
                    </AlertDescription>
                </Alert>
            )}


            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={`bid-skeleton-${i}`} className="h-64" />)}
                </div>
            )}

            {!loading && bids?.length === 0 && !error && (
                <Card className="bg-glass">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No active requirements found in the marketplace.
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!loading && bids?.map(bid => {
                    if (!bid?.id) return null;
                    return <BidCard key={bid.id} bid={bid as Bid} />;
                })}
            </div>
        </div>
    );
}
