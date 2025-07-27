
'use client';
import { useState, FormEvent } from 'react';
import { useBidding } from '@/hooks/use-bidding';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function PlaceBidDialog({ item }: { item: MarketplaceItem }) {
    const { placeBid, isPlacingBid } = useBidding();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Bid', description: 'Please enter a positive bid amount.' });
            return;
        }

        try {
            await placeBid(item, Number(amount));
            toast({ title: 'Bid Submitted!', description: `Your bid of $${amount} for ${item.name} was placed.` });
            setIsOpen(false);
            setAmount('');
        } catch (error) {
            // Toast is handled in the hook
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">Place Bid</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-glass">
                <DialogHeader>
                    <DialogTitle>Place a Bid on {item.name}</DialogTitle>
                    <DialogDescription>
                        The current starting price is ${item.currentPrice.toFixed(2)}. Enter your bid amount below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="amount">Bid Amount ($)</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                placeholder={`e.g. ${item.currentPrice.toFixed(2)}`}
                                step="0.01"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isPlacingBid}>
                            {isPlacingBid && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Bid
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
