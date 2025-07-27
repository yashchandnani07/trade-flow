
'use client';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Star } from 'lucide-react';

const reviewSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier."),
  rating: z.coerce.number().min(1, "Rating is required").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(500),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const RatingInput = ({ rating, onRate }: { rating: number, onRate: (rating: number) => void }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
        <Star
            key={i}
            className={cn(
                "w-6 h-6 cursor-pointer transition-colors",
                i < rating ? 'text-primary fill-primary' : 'text-muted-foreground/30 hover:text-muted-foreground/50'
            )}
            onClick={() => onRate(i + 1)}
        />
        ))}
    </div>
);


function SupplierCombobox({ onSelect, value, suppliers, loading }: { onSelect: (id: string) => void, value: string, suppliers: User[], loading: boolean }) {
  const [open, setOpen] = useState(false);
  const selectedSupplierName = useMemo(() => {
    return suppliers.find(s => s.uid === value)?.businessName || "Select a supplier...";
  }, [value, suppliers]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : selectedSupplierName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search supplier..." />
          <CommandList>
            <CommandEmpty>No supplier found.</CommandEmpty>
            <CommandGroup>
              {suppliers.map((supplier) => (
                <CommandItem
                  key={supplier.uid}
                  value={supplier.businessName || ''}
                  onSelect={() => {
                    onSelect(supplier.uid);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === supplier.uid ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {supplier.businessName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


export default function SupplierReviewPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const usersCollection = useMemo(() => collection(db, 'users'), []);
  const q = useMemo(() => query(usersCollection, where("role", "==", "supplier")), [usersCollection]);
  const [suppliersSnapshot, suppliersLoading] = useCollectionData(q, { idField: 'uid' });
  const suppliers = (suppliersSnapshot || []) as User[];

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { supplierId: "", rating: 0, comment: "" },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'You must be logged in to submit a review.' });
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        vendorId: user.uid,
        supplierId: data.supplierId,
        rating: data.rating,
        comment: data.comment,
        author: user.businessName || "Anonymous Vendor",
        avatar: user.businessName?.[0] || "A",
        timestamp: serverTimestamp(),
        verified: true, // Simplified: all reviews are marked as verified
      });
      toast({ title: 'Review Submitted!', description: 'Thank you for your valuable feedback.' });
      form.reset();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'There was a problem submitting your review.' });
    }
  };

  const isSubmitDisabled = form.formState.isSubmitting;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card className="max-w-2xl mx-auto bg-glass">
        <CardHeader>
          <CardTitle>Submit a Supplier Review</CardTitle>
          <CardDescription>Share your experience to help our community.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                     <SupplierCombobox
                        onSelect={field.onChange}
                        value={field.value}
                        suppliers={suppliers}
                        loading={suppliersLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Rating</FormLabel>
                    <FormControl>
                        <RatingInput rating={field.value} onRate={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your experience, the quality of products, and the delivery process..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitDisabled} className="w-full">
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Review
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
