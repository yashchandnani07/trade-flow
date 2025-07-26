
'use client';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gavel, AlertTriangle, Loader2, Handshake } from 'lucide-react';
import { collection, query, where, orderBy, addDoc, serverTimestamp, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import type { Bid, Proposal } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { PackageSearch, Inbox } from 'lucide-react';


const statusVariantMap = {
    active: "secondary",
    closed: "outline",
    awarded: "default"
} as const;


function ProposalsDialog({ bid }: { bid: Bid }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const proposalsCollection = useMemo(() => collection(db, 'bids', bid.id, 'proposals'), [bid.id]);
  const proposalsQuery = useMemo(() => query(proposalsCollection, orderBy("createdAt", "asc")), [proposalsCollection]);
  const [proposals, loading, error, proposalsSnapshot] = useCollectionData(proposalsQuery, { idField: 'id' });
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  
  const handleAcceptProposal = async (proposal: Proposal) => {
    setIsAccepting(proposal.id);
     try {
        const batch = writeBatch(db);

        const bidRef = doc(db, 'bids', bid.id);
        batch.update(bidRef, { status: 'awarded' });

        const acceptedProposalRef = doc(db, 'bids', bid.id, 'proposals', proposal.id);
        batch.update(acceptedProposalRef, { status: 'accepted' });

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
            description: `You have accepted the bid from ${proposal.supplierName}.`,
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
            return (
              <div key={proposal.id} className="flex justify-between items-center bg-background/50 p-4 rounded-lg">
                <div>
                  <p className="font-semibold">{proposal.supplierName}</p>
                  <p className="text-2xl font-bold text-primary">₹{proposal.bidAmount.toLocaleString()}</p>
                </div>
                {isBidOwner && bid.status === 'active' ? (
                   <Button size="sm" onClick={() => handleAcceptProposal(proposal)} disabled={isAccepting !== null}>
                       {isAccepting === proposal.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Handshake className="mr-2 h-4 w-4" />}
                       Accept Bid
                   </Button>
                ) : (
                    <Badge variant={proposal.status === 'accepted' ? 'default' : 'outline'} className="capitalize">{proposal.status}</Badge>
                )}
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



const BidCard = ({ bid }: { bid: Bid }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
    
    const createdAt = bid.createdAt?.toDate ? formatDistanceToNow(bid.createdAt.toDate(), { addSuffix: true }) : 'just now';
    const isSupplier = user?.role === 'supplier';
    const isVendorOwner = user?.uid === bid.vendorId;

    const handleBidSubmit = async (e: React.FormEvent) => {
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
                supplierName: user.businessName,
                bidAmount: Number(bidAmount),
                createdAt: serverTimestamp(),
                status: 'pending',
            });
            toast({
                title: 'Bid Placed Successfully!',
                description: `Your bid of ₹${bidAmount} for ${bid.item} has been submitted.`,
            });
            setIsDialogOpen(false);
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
        <Dialog>
            <div className="border p-4 rounded-lg bg-background/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h3 className="font-semibold text-lg">{bid.item}</h3>
                    <p className="text-sm text-muted-foreground">
                        {bid.quantity} kg | Target Price: ₹{bid.targetPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Posted by {bid.vendorName} • {createdAt}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant={statusVariantMap[bid.status] || 'outline'} className="capitalize">{bid.status}</Badge>
                     {isSupplier && (
                         <Button size="sm" onClick={() => setIsDialogOpen(true)}>Place Bid</Button>
                     )}
                     {isVendorOwner && (
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">View Proposals</Button>
                        </DialogTrigger>
                     )}
                </div>
            </div>

            {/* Dialog for Placing a Bid (for Suppliers) */}
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
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Bid
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            
            {/* Dialog for Viewing Proposals (for Vendors) */}
            {isVendorOwner && <ProposalsDialog bid={bid} />}
        </Dialog>
    )
};


const BiddingDashboard = () => {
    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const bidsQuery = useMemo(() => query(bidsCollection, where("status", "==", "active"), orderBy("createdAt", "desc")), [bidsCollection]);
    const [bids, loading, error] = useCollectionData(bidsQuery, { idField: 'id' });

    return (
        <Card className="bg-glass">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Bidding Dashboard</CardTitle>
                <CardDescription>Active requirements from vendors</CardDescription>
            </div>
            <Gavel className="w-6 h-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Bids</AlertTitle>
                    <AlertDescription>
                        Could not load active bids. Please try again later.
                        <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                    </AlertDescription>
                </Alert>
            )}
            {!loading && !error && (!bids || bids.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                    <p>No active bidding requirements at the moment.</p>
                </div>
            )}
            {!loading && bids && bids.map(bid => (
                <BidCard key={bid.id} bid={bid as Bid} />
            ))}
            </div>
        </CardContent>
        </Card>
    );
};

export default BiddingDashboard;
