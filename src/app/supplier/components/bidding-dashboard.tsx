
'use client';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gavel, AlertTriangle, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import type { Bid } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const BidCard = ({ bid }: { bid: Bid }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
    
    const createdAt = bid.createdAt?.toDate ? formatDistanceToNow(bid.createdAt.toDate(), { addSuffix: true }) : 'just now';

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
        <>
            <Card className="bg-secondary/50 p-4">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                        <p className="font-semibold text-lg">{bid.item}</p>
                        <p className="text-sm text-muted-foreground">
                            {bid.quantity} kg required by {bid.vendorName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Target Price: <span className="font-medium text-foreground">₹{bid.targetPrice.toLocaleString()}</span>
                        </p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end gap-2">
                         <p className="text-xs text-muted-foreground">{createdAt}</p>
                        <Button size="sm" onClick={() => setIsDialogOpen(true)}>Place Bid</Button>
                    </div>
                </div>
            </Card>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Bid
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
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
