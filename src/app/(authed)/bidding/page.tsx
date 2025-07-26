
'use client';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, serverTimestamp, query, where, orderBy, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, AlertTriangle, PackageSearch, Handshake, Inbox } from 'lucide-react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { type Bid, type Proposal } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

const bidSchema = z.object({
  item: z.string().min(1, 'Item name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  targetPrice: z.coerce.number().min(1, 'Target price must be positive'),
});

type BidFormValues = z.infer<typeof bidSchema>;

const statusVariantMap = {
    active: "secondary",
    closed: "outline",
    awarded: "default"
} as const;

function ProposalsDialog({ bid }: { bid: Bid }) {
  const { toast } = useToast();
  const proposalsCollection = useMemo(() => collection(db, 'bids', bid.id, 'proposals'), [bid.id]);
  const proposalsQuery = useMemo(() => query(proposalsCollection, orderBy("createdAt", "asc")), [proposalsCollection]);
  const [proposals, loading, error, proposalsSnapshot] = useCollectionData(proposalsQuery, { idField: 'id' });
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  
  const handleAcceptProposal = async (proposal: Proposal) => {
    setIsAccepting(proposal.id);
     try {
        const batch = writeBatch(db);

        // 1. Update the bid status to 'awarded'
        const bidRef = doc(db, 'bids', bid.id);
        batch.update(bidRef, { status: 'awarded' });

        // 2. Update the accepted proposal's status
        const acceptedProposalRef = doc(db, 'bids', bid.id, 'proposals', proposal.id);
        batch.update(acceptedProposalRef, { status: 'accepted' });

        // 3. Update all other proposals to 'rejected'
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
                {bid.status === 'active' ? (
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


function MyBidsList() {
    const { user } = useAuth();
    
    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const bidsQuery = useMemo(() => {
        if (!user) return null;
        return query(bidsCollection, where("vendorId", "==", user.uid), orderBy("createdAt", "desc"));
    }, [bidsCollection, user]);

    const [bids, loading, error] = useCollectionData(bidsQuery, { idField: 'id' });

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-2">Loading your bids...</p>
            </div>
        );
    }

    if (error) {
         return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Bids</AlertTitle>
                <AlertDescription>
                    Could not load your bids. Please try again later.
                    <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Card className="bg-glass mt-8">
            <CardHeader>
                <CardTitle>My Posted Requirements</CardTitle>
                <CardDescription>Track the status of your active and past bids.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {bids && bids.length > 0 ? (
                        bids.map(bid => {
                            const typedBid = bid as Bid;
                            const createdAt = typedBid.createdAt?.toDate ? formatDistanceToNow(typedBid.createdAt.toDate(), { addSuffix: true }) : 'just now';
                            return (
                                <Dialog key={typedBid.id}>
                                    <div className="border p-4 rounded-lg bg-background/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">{typedBid.item}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {typedBid.quantity} kg | Target Price: ₹{typedBid.targetPrice.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">{createdAt}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={statusVariantMap[typedBid.status] || 'outline'} className="capitalize">{typedBid.status}</Badge>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">View Proposals</Button>
                                            </DialogTrigger>
                                        </div>
                                    </div>
                                    <ProposalsDialog bid={typedBid} />
                                </Dialog>
                            )
                        })
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <PackageSearch className="w-12 h-12 mx-auto mb-4" />
                            <p>You haven't posted any requirements yet.</p>
                            <p className="text-sm">Use the form above to get started.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default function BiddingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      item: '',
      quantity: 1,
      targetPrice: 100,
    },
  });

  const onSubmit: SubmitHandler<BidFormValues> = async (data) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated', description: 'You must be logged in to post a bid.' });
      return;
    }

    try {
      await addDoc(collection(db, 'bids'), {
        ...data,
        vendorId: user.uid,
        vendorName: user.businessName || 'Unnamed Vendor',
        status: 'active',
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Bid Submitted!',
        description: 'Your requirement has been posted for suppliers to bid on.',
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not post your requirement. Please try again.',
      });
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Bidding Marketplace</h2>
      <Card className="bg-glass">
        <CardHeader>
          <CardTitle>Post a New Requirement</CardTitle>
          <CardDescription>Let suppliers know what you need and get the best offers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
              <FormField
                control={form.control}
                name="item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product / Item</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fresh Chicken" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (in kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Requirement
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <MyBidsList />

    </div>
  );
}
