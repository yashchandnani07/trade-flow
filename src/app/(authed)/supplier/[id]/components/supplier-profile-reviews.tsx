
'use client';
import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < Math.round(rating) ? "text-primary fill-primary" : "text-muted-foreground/50"
          )}
        />
      ))}
    </div>
  );
}

export default function SupplierProfileReviews({ supplierId }: { supplierId: string }) {
    const reviewsCollection = useMemo(() => collection(db, 'reviews'), []);
    const reviewsQuery = useMemo(() => query(reviewsCollection, where("supplierId", "==", supplierId), orderBy("timestamp", "desc")), [reviewsCollection, supplierId]);
    const [reviews, loading, error] = useCollectionData(reviewsQuery, { idField: 'id' });

    const renderContent = () => {
        if (loading) {
            return (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4 items-start">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
             return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Reviews</AlertTitle>
                    <AlertDescription>
                        There was a problem fetching reviews. This is often due to Firestore security rules.
                        <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                    </AlertDescription>
                </Alert>
            );
        }
        
        if (reviews && reviews.length > 0) {
            return (
                 <div className="space-y-4">
                    {reviews.map(reviewData => {
                        const review = reviewData as Review;
                        const date = review.timestamp ? (review.timestamp as any).toDate() : new Date();
                        return (
                            <div key={review.id} className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/40x40?text=${review.avatar}`} />
                                    <AvatarFallback>{review.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">{review.author}</p>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(date, { addSuffix: true })}</p>
                                    <p className="text-sm mt-1">{review.comment}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )
        }

        return (
            <div className="text-center text-muted-foreground py-8">
                <p>No reviews for this supplier yet.</p>
            </div>
        );
    }


    return (
        <Card className="h-full flex flex-col glassmorphic">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Reviews</span>
                </CardTitle>
                <CardDescription>
                    Feedback from vendors who have worked with this supplier.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
               {renderContent()}
            </CardContent>
        </Card>
    );
}

