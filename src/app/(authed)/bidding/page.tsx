
'use client';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { MarketplaceBidsList } from '@/components/bids/marketplace-bids-list';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const bidSchema = z.object({
  item: z.string().min(1, 'Item name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  targetPrice: z.coerce.number().min(1, 'Target price must be positive'),
});

type BidFormValues = z.infer<typeof bidSchema>;

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
          {!user ? (
             <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Not Authenticated</AlertTitle>
                <AlertDescription>
                  You must be logged in to post a bid. <Link href="/" className="font-bold underline">Login or Sign Up</Link>
                </AlertDescription>
            </Alert>
          ) : (
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
          )}
        </CardContent>
      </Card>
      
      <MarketplaceBidsList />

    </div>
  );
}
