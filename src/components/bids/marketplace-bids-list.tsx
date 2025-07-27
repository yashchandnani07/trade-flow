
'use client';
import React, { useMemo, useState, FormEvent, ReactNode } from 'react';
import { collection, query, where, orderBy, Timestamp, addDoc, serverTimestamp, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, AlertTriangle, PackageSearch, Handshake, Inbox, MessageSquare, CornerDownLeft, Minus, Plus, ShieldCheck } from 'lucide-react';
import { type Bid, type Proposal } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const statusVariantMap: Record<Bid['status'], 'success' | 'outline' | 'default'> = {
    active: "success",
    closed: "outline",
    awarded: "default"
} as const;

const proposalStatusVariantMap: Record<Proposal['status'], "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    accepted: "default",
    rejected: "destructive",
    negotiating: "secondary",
};


function NegotiationDialog({ bid, proposal, user, children }: { bid: Bid, proposal: Proposal, user: any, children: ReactNode }) {
    const [counterAmount, setCounterAmount] = useState<number | ''>('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const handleNegotiationSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || counterAmount === '' || counterAmount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Counter-offer', description: 'Please enter a valid amount.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const proposalRef = doc(db, 'bids', bid.id, 'proposals', proposal.id);
            await updateDoc(proposalRef, {
                status: 'negotiating',
                counterOffer: {
                    amount: Number(counterAmount),
                    message: message,
                    from: 'vendor'
                }
            });
            toast({ title: 'Counter-offer Sent!', description: `Your counter-offer of ?${counterAmount} has been sent to ${proposal.supplierName}.` });
            setIsOpen(false);
            setCounterAmount('');
            setMessage('');
        } catch (error) {
            console.error('Error sending counter-offer:', error);
            toast({ variant: 'destructive', title: 'Failed to Send', description: 'There was an error sending your counter-offer.' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md bg-glass">
                <DialogHeader>
                    <DialogTitle>Negotiate with {proposal.supplierName}</DialogTitle>
                    <DialogDescription>
                        Their current offer is ?{proposal.bidAmount.toLocaleString()}. You can propose a new price.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleNegotiationSubmit}>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="counter-amount" className="text-sm font-medium">Your Counter-offer (?)</Label>
                            <Input
                                id="counter-amount"
                                type="number"
                                value={counterAmount}
                                onChange={(e) => setCounterAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="e.g., 9000"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="message" className="text-sm font-medium">Optional Message</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="e.g., Can you do this price for a long-term contract?"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Counter-offer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


function ProposalsDialog({ bid, user }: { bid: Bid, user: any }) {
  const { toast } = useToast();
  
  const proposalsCollection = useMemo(() => {
    if (!bid.id) return null;
    return collection(db, 'bids', bid.id, 'proposals');
  }, [bid.id]);

  const proposalsQuery = useMemo(() => {
    if (!proposalsCollection) return null;
    return query(proposalsCollection, orderBy("createdAt", "asc"));
  }, [proposalsCollection]);

  const [proposals, loading, error, proposalsSnapshot] = useCollectionData(proposalsQuery, { idField: 'id' });
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  
  const handleAcceptProposal = async (proposal: Proposal) => {
    setIsAccepting(proposal.id);
     try {
        const batch = writeBatch(db);
        const bidRef = doc(db, 'bids', bid.id);
        
        const finalAmount = proposal.status === 'negotiating' && proposal.counterOffer ? proposal.counterOffer.amount : proposal.bidAmount;

        batch.update(bidRef, { status: 'awarded', awardedTo: proposal.supplierId, finalAmount });
        
        const acceptedProposalRef = doc(db, 'bids', bid.id, 'proposals', proposal.id);
        batch.update(acceptedProposalRef, { status: 'accepted', finalAmount });

        if(proposalsSnapshot) {
            proposalsSnapshot.docs.forEach(proposalDoc => {
                if (proposalDoc.id !== proposal.id) {
                    batch.update(proposalDoc.ref, { status: 'rejected' });
                }
            });
        }
        
        await batch.commit();

        toast({
            title: "Bid Awarded!",
            description: `You have accepted the bid from ${proposal.supplierName} for ?${finalAmount.toLocaleString()}.`,
        });

    } catch (e) {
        console.error("Error accepting proposal: ", e);
        toast({
            variant: "destructive",
            title: "Failed to Accept",
            description: "There was an error while awarding the bid. Please try again.",
        });
    } finally {
        setIsAccepting(null);
    }
  }

  const isBidOwner = user?.uid === bid.vendorId;
  const isSupplier = user?.role === 'supplier';

  if (!proposalsQuery) {
    return (
        <DialogContent className="sm:max-w-3xl bg-glass">
            <DialogHeader>
                <DialogTitle>Loading Proposals...</DialogTitle>
            </DialogHeader>
        </DialogContent>
    )
  }

  return (
    <DialogContent className="sm:max-w-3xl bg-glass">
      <DialogHeader>
        <DialogTitle className="text-xl">Proposals for {bid.item}</DialogTitle>
        <DialogDescription>
          Review and manage bids from suppliers for this requirement.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {loading && <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}
        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>}
        {!loading && proposals && proposals.length > 0 ? (
          proposals.map(p => {
            const proposal = p as Proposal;
            const isMyProposal = user?.uid === proposal.supplierId;
            const isExactMatch = proposal.bidAmount === bid.targetPrice;

            return (
              <div key={proposal.id} className={cn("flex flex-col sm:flex-row justify-between sm:items-center bg-background/50 p-4 rounded-lg gap-4 border", isExactMatch && "border-green-500/50")}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-lg">{proposal.supplierName}</p>
                     <Badge variant={proposalStatusVariantMap[proposal.status || 'pending']} className="capitalize text-sm">{proposal.status}</Badge>
                     {isExactMatch && <ShieldCheck className="w-5 h-5 text-green-500" />}
                  </div>
                  <p className="text-3xl font-bold text-primary">?{proposal.bidAmount.toLocaleString()}</p>
                  {proposal.status === 'negotiating' && proposal.counterOffer && (
                     <Card className="mt-2 bg-muted/50 border-primary/20">
                        <CardContent className="p-3">
                           <p className="font-semibold text-primary flex items-center gap-2 text-md">
                                <CornerDownLeft className="w-5 h-5"/>
                                Counter-offer from {proposal.counterOffer.from}: ?{proposal.counterOffer.amount.toLocaleString()}
                           </p>
                           {proposal.counterOffer.message && <p className="text-muted-foreground mt-1 italic text-sm">"{proposal.counterOffer.message}"</p>}
                        </CardContent>
                    </Card>
                  )}
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                {isBidOwner && bid.status === 'active' && proposal.status !== 'accepted' &&(
                  <>
                    <NegotiationDialog bid={bid} proposal={proposal} user={user}>
                        <Button variant="outline" size="lg" disabled={isAccepting !== null}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Negotiate
                        </Button>
                    </NegotiationDialog>
                    <Button size="lg" onClick={() => handleAcceptProposal(proposal)} disabled={isAccepting !== null}>
                       {isAccepting === proposal.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Handshake className="mr-2 h-4 w-4" />}
                       Accept
                   </Button>
                  </>
                )}
                {isSupplier && isMyProposal && proposal.status === 'negotiating' && bid.status === 'active' && proposal.counterOffer?.from === 'vendor' &&(
                    <>
                        <Button variant="outline" size="lg" disabled={isAccepting !== null}>
                           <CornerDownLeft className="mr-2 h-4 w-4" /> Revise Bid
                        </Button>
                        <Button size="lg" onClick={() => handleAcceptProposal(proposal)} disabled={isAccepting !== null}>
                            {isAccepting === proposal.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Handshake className="mr-2 h-4 w-4" />}
                           Accept Counter
                       </Button>
                    </>
                )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <Inbox className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg">No proposals received yet.</p>
          </div>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary" size="lg">Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

const BidCard = ({ bid, user }: { bid: Bid; user: any }) => {
    const { toast } = useToast();
    const [bidAmount, setBidAmount] = useState(bid.targetPrice);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    React.useEffect(() => {
        if (bid) {
            setBidAmount(bid.targetPrice);
        }
    }, [bid]);


    const createdAt = bid.createdAt instanceof Timestamp 
        ? formatDistanceToNow(bid.createdAt.toDate(), { addSuffix: true }) 
        : 'just now';

    const isSupplier = user?.role === 'supplier';
    const isVendorOwner = user?.uid === bid.vendorId;

    const handleBidSubmit = async (theBid: Bid, amount: number) => {
        console.log("Submitting bid for:", theBid);
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to place a bid.' });
            return;
        }
        if (!theBid || !theBid.id) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot place bid. Bid information is missing.' });
            console.error("Bid information is missing. Received:", theBid);
            return;
        }

        setIsSubmitting(true);
        try {
            const proposalsCollection = collection(db, 'bids', theBid.id, 'proposals');
            const businessName = user.businessName || 'Unnamed Supplier';

            await addDoc(proposalsCollection, {
                supplierId: user.uid,
                supplierName: businessName,
                bidAmount: Number(amount),
                createdAt: serverTimestamp(),
                status: 'pending',
            });

            toast({
                title: 'Bid Placed Successfully!',
                description: `Your bid of ?${amount} for ${theBid.item} has been submitted.`,
            });
        } catch (error) {
            console.error('Error placing bid:', error);
            toast({ variant: 'destructive', title: 'Failed to Place Bid', description: `There was an error submitting your bid. ${error}` });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const adjustBid = (adjustment: number) => {
        setBidAmount(prev => Math.max(0, prev + adjustment));
    };

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>, theBid: Bid) => {
        e.preventDefault();
        handleBidSubmit(theBid, bidAmount);
    }
    
    const onMatchAndAccept = (theBid: Bid) => {
        setBidAmount(theBid.targetPrice);
        handleBidSubmit(theBid, theBid.targetPrice);
    }


    return (
        <Card className="p-6 rounded-xl bg-background/50 flex flex-col justify-between gap-6 border-2">
            <div>
                <div className="flex flex-wrap items-center gap-4 mb-2">
                    <h3 className="font-semibold text-2xl">{bid.item}</h3>
                    <Badge variant={statusVariantMap[bid.status] || 'outline'} className="capitalize text-sm h-7">{bid.status}</Badge>
                </div>
                <p className="text-lg text-muted-foreground">
                    {bid.quantity} kg | Target Price: ?{bid.targetPrice.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    Posted by {bid.vendorName} ? {createdAt}
                </p>
            </div>
            <div className="flex flex-col gap-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="lg" className="w-full">View Proposals</Button>
                    </DialogTrigger>
                    <ProposalsDialog bid={bid} user={user} />
                </Dialog>

                {isSupplier && !isVendorOwner && bid.status === 'active' && (
                    <Card className="bg-glass p-4">
                        <form onSubmit={(e) => onFormSubmit(e, bid)}>
                            <Label className="text-sm font-semibold mb-2 block">Your Offer (?)</Label>
                            <div className="flex items-center gap-2 mb-4">
                                <Button type="button" variant="outline" size="icon" onClick={() => adjustBid(-100)} disabled={isSubmitting}><Minus className="h-4 w-4" /></Button>
                                <Input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(Number(e.target.value))}
                                    className="text-center font-bold text-lg"
                                    disabled={isSubmitting}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={() => adjustBid(100)} disabled={isSubmitting}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Offer"}
                                </Button>
                                <Button type="button" onClick={() => onMatchAndAccept(bid)} className="flex-1" variant="outline" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><Handshake className="mr-2 h-4 w-4" /> Match & Accept</>}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </Card>
    );
};


export function MarketplaceBidsList() {
    const { user } = useAuth();
    
    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const bidsQuery = useMemo(() => {
        return query(bidsCollection, where("status", "in", ["active", "awarded", "closed"]), orderBy("createdAt", "desc"));
    }, [bidsCollection]);

    const [bids, loading, error] = useCollectionData(bidsQuery, { idField: 'id' });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="ml-4 text-lg">Loading marketplace requirements...</p>
            </div>
        );
    }

    if (error) {
         return (
            <Alert variant="destructive" className="my-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Bids</AlertTitle>
                <AlertDescription>
                    Could not load bids. Please try again later. Ensure your firestore.rules are set up correctly.
                    <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Card className="bg-glass mt-8 border-0 shadow-none">
            <CardHeader className="px-0">
                <CardTitle className="text-3xl">Active Marketplace Requirements</CardTitle>
                <CardDescription className="text-base">Browse active requirements from all vendors and place your bids.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-6">
                    {bids && bids.length > 0 ? (
                        bids.map(bidData => (
                            <BidCard key={bidData.id} bid={bidData as Bid} user={user} />
                        ))
                    ) : (
                        <div className="text-center py-16 text-muted-foreground bg-background/30 rounded-lg">
                            <PackageSearch className="w-20 h-20 mx-auto mb-6" />
                            <p className="text-xl">There are no active requirements in the marketplace right now.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
