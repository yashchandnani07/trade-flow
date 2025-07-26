
'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const reviewSchema = z.object({
  rating: z.coerce.number().min(1, "Rating is required").max(5),
  review: z.string().min(10, "Review must be at least 10 characters.").max(500),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const RatingInput = ({ rating, onRate }: { rating: number, onRate: (rating: number) => void }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
        <Star
            key={i}
            className={cn(
                "w-8 h-8 cursor-pointer transition-colors",
                i < rating ? 'text-primary fill-primary' : 'text-muted-foreground/30 hover:text-muted-foreground/50'
            )}
            onClick={() => onRate(i + 1)}
        />
        ))}
    </div>
);

export function OrderReview({ order }: { order: Order }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: order.rating || 0, review: order.review || "" },
    });

    const onSubmit = async (data: ReviewFormValues) => {
        setIsSubmitting(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, {
                rating: data.rating,
                review: data.review,
            });
            toast({
                title: "Review Submitted!",
                description: "Thank you for your feedback."
            });
        } catch (error) {
            console.error("Error submitting review:", error);
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: 'Could not submit your review. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const hasBeenReviewed = !!order.rating;

    if (hasBeenReviewed) {
        return (
             <Card className="glassmorphic">
                <CardHeader>
                    <CardTitle>Your Review</CardTitle>
                    <CardDescription>You have already reviewed this order.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        <RatingInput rating={order.rating!} onRate={() => {}} />
                        <p className="text-muted-foreground italic">"{order.review}"</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
                <CardDescription>Share your experience with this order and supplier.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
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
                            name="review"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Review</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Describe your experience with the product quality and delivery..."
                                    rows={5}
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Review
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
