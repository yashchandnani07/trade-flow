
'use client';
import { useMemo, useState, FormEvent, ReactNode } from 'react';
import { collection, query, where, orderBy, Timestamp, addDoc, serverTimestamp, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, AlertTriangle, PackageSearch, Handshake, Inbox, MessageSquare, CornerDownLeft } from 'lucide-react';
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

const statusVariantMap = {
    active: "secondary",
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
            toast({ title: 'Counter-offer Sent!', description: `Your counter-offer of ₹${counterAmount} has been sent to ${proposal.supplierName}.` });
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
                        Their current offer is ₹{proposal.bidAmount.toLocaleString()}. You can propose a new price.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleNegotiationSubmit}>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="counter-amount" className="text-sm font-medium">Your Counter-offer (₹)</Label>
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
            description: `You have accepted the bid from ${proposal.supplierName} for ₹${finalAmount.toLocaleString()}.`,
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
        <DialogContent className="sm:max-w-2xl bg-glass">
            <DialogHeader>
                <DialogTitle>Loading Proposals...</DialogTitle>
            </DialogHeader>
        </DialogContent>
    )
  }

  return (
    <DialogContent className="sm:max-w-2xl bg-glass">
      <DialogHeader>
        <DialogTitle>Proposals for {bid.item}</DialogTitle>
        <DialogDescription>
          Review and manage bids from suppliers for this requirement.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {loading && <div className="flex items-center justify-center p-4"><Loader2 className="w-6 h-6 animate-spin" /></div>}
        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>}
        {!loading && proposals && proposals.length > 0 ? (
          proposals.map(p => {
            const proposal = p as Proposal;
            const isMyProposal = user?.uid === proposal.supplierId;

            return (
              <div key={proposal.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-background/50 p-4 rounded-lg gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{proposal.supplierName}</p>
                     <Badge variant={proposalStatusVariantMap[proposal.status || 'pending']} className="capitalize">{proposal.status}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">₹{proposal.bidAmount.toLocaleString()}</p>
                  {proposal.status === 'negotiating' && proposal.counterOffer && (
                     <Card className="mt-2 bg-muted/50 border-primary/20">
                        <CardContent className="p-3 text-sm">
                           <p className="font-semibold text-primary flex items-center gap-1">
                                <CornerDownLeft className="w-4 h-4"/>
                                Counter-offer from {proposal.counterOffer.from}: ₹{proposal.counterOffer.amount.toLocaleString()}
                           </p>
                           {proposal.counterOffer.message && <p className="text-muted-foreground mt-1 italic">"{proposal.counterOffer.message}"</p>}
                        </CardContent>
                    </Card>
                  )}
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                {isBidOwner && bid.status === 'active' && proposal.status !== 'accepted' &&(
                  <>
                    <NegotiationDialog bid={bid} proposal={proposal} user={user}>
                        <Button variant="outline" size="sm" disabled={isAccepting !== null}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Negotiate
                        </Button>
                    </NegotiationDialog>
                    <Button size="sm" onClick={() => handleAcceptProposal(proposal)} disabled={isAccepting !== null}>
                       {isAccepting === proposal.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Handshake className="mr-2 h-4 w-4" />}
                       Accept
                   </Button>
                  </>
                )}
                {isSupplier && isMyProposal && proposal.status === 'negotiating' && bid.status === 'active' && proposal.counterOffer?.from === 'vendor' &&(
                    <>
                        <Button variant="outline" size="sm" disabled={isAccepting !== null}>
                           <CornerDownLeft className="mr-2 h-4 w-4" /> Revise Bid
                        </Button>
                        <Button size="sm" onClick={() => handleAcceptProposal(proposal)} disabled={isAccepting !== null}>
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
            <Inbox className="w-12 h-12 mx-auto mb-4" />
            <p>No proposals received yet.</p>
          </div>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function PlaceBidDialog({ bid, user, children }: { bid: Bid, user: any, children: ReactNode }) {
    const [bidAmount, setBidAmount] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const handleBidSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || bidAmount === '' || bidAmount <= 0) {
             toast({
                variant: 'destructive',
                title: 'Invalid Bid',
                description: 'Please enter a valid bid amount.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const proposalsCollection = collection(db, 'bids', bid.id, 'proposals');
            await addDoc(proposalsCollection, {
                supplierId: user.uid,
                supplierName: user.businessName || 'Unnamed Supplier',
                bidAmount: Number(bidAmount),
                createdAt: serverTimestamp(),
                status: 'pending',
            });
            toast({
                title: 'Bid Placed Successfully!',
                description: `Your bid of ₹${bidAmount} for ${bid.item} has been submitted.`,
            });
            setIsOpen(false);
            setBidAmount('');
        } catch (error) {
             console.error('Error placing bid:', error);
             toast({
                variant: 'destructive',
                title: 'Failed to Place Bid',
                description: 'There was an error submitting your bid. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-glass">
                <DialogHeader>
                    <DialogTitle>Place a Bid for {bid.item}</DialogTitle>
                    <DialogDescription>
                        Submit your best offer for this requirement. The vendor will be notified of your bid.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBidSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Your Bid (₹)
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                className="col-span-3"
                                placeholder="e.g., 9500"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Bid
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function MarketplaceBidsList() {
    const { user } = useAuth();
    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const bidsQuery = useMemo(() => {
        return query(bidsCollection, where("status", "==", "active"), orderBy("createdAt", "desc"));
    }, [bidsCollection]);

    const [bids, loading, error] = useCollectionData(bidsQuery, { idField: 'id' });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-2">Loading marketplace requirements...</p>
            </div>
        );
    }

    if (error) {
         return (
            <Alert variant="destructive">
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
        <Card className="bg-glass mt-8">
            <CardHeader>
                <CardTitle>Active Marketplace Requirements</CardTitle>
                <CardDescription>Browse active requirements from all vendors and place your bids.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {bids && bids.length > 0 ? (
                        bids.map(bidData => {
                            const bid = bidData as Bid;
                            const createdAt = bid.createdAt instanceof Timestamp 
                                ? formatDistanceToNow(bid.createdAt.toDate(), { addSuffix: true }) 
                                : 'just now';
                            const isSupplier = user?.role === 'supplier';
                            const isVendorOwner = user?.uid === bid.vendorId;

                            return (
                                <Card key={bid.id} className="p-4 rounded-lg bg-background/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{bid.item}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {bid.quantity} kg | Target Price: ₹{bid.targetPrice.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Posted by {bid.vendorName} • {createdAt}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={statusVariantMap[bid.status] || 'outline'} className="capitalize">{bid.status}</Badge>
                                        
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">View Proposals</Button>
                                            </DialogTrigger>
                                            <ProposalsDialog bid={bid} user={user} />
                                        </Dialog>

                                        {isSupplier && !isVendorOwner && bid.status === 'active' && (
                                            <PlaceBidDialog bid={bid} user={user}>
                                                <Button size="sm">Place Bid</Button>
                                            </PlaceBidDialog>
                                        )}
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <PackageSearch className="w-12 h-12 mx-auto mb-4" />
                            <p>There are no active requirements in the marketplace right now.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
