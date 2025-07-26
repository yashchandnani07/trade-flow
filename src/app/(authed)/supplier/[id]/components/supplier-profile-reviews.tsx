
'use client';
import { useState, useMemo, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, serverTimestamp, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';


const RatingInput = ({ rating, onRate, readOnly = false }: { rating: number, onRate?: (rating: number) => void, readOnly?: boolean }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={cn(
            "w-5 h-5",
            i < rating ? 'text-primary fill-primary' : 'text-muted-foreground/50',
            !readOnly && "cursor-pointer"
        )}
        onClick={() => onRate && onRate(i + 1)}
      />
    ))}
  </div>
);

const SupplierProfileReviews = ({ supplierId }: { supplierId: string }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(0);

    const reviewsCollection = useMemo(() => collection(db, 'reviews'), []);
    const reviewsQuery = useMemo(() => query(reviewsCollection, where("supplierId", "==", supplierId), orderBy("date", "desc")), [reviewsCollection, supplierId]);
    const [reviewsSnapshot, loading, error] = useCollectionData(reviewsQuery, {
      idField: 'id'
    });

    const reviews: Review[] = useMemo(() => {
        if (!reviewsSnapshot) return [];
        return reviewsSnapshot.map(doc => {
            const data = doc as Omit<Review, 'id' | 'date'> & { date: Timestamp };
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate ? data.date.toDate().toLocaleDateString('en-CA') : 'Date not available',
            };
        });
    }, [reviewsSnapshot]);
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && newRating > 0 && user) {
            try {
                await addDoc(collection(db, "reviews"), {
                    supplierId,
                    author: user.businessName || "Anonymous Vendor",
                    avatar: user.businessName?.[0] || "A",
                    date: serverTimestamp(),
                    rating: newRating,
                    comment: newComment,
                    userId: user.uid,
                });
                setNewComment("");
                setNewRating(0);
                 toast({
                    title: "Review Submitted!",
                    description: "Thank you for your feedback.",
                });
            } catch (e) {
                console.error("Error adding document: ", e);
                 toast({
                    variant: "destructive",
                    title: "Submission Failed",
                    description: "Could not submit your review. Please try again.",
                });
            }
        }
    };

  return (
    <Card className="bg-glass">
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <CardDescription>Feedback from other vendors for this supplier</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
        {loading && (
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
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Reviews</AlertTitle>
                <AlertDescription>
                    There was a problem fetching reviews. This is often due to Firestore security rules. Please ensure your rules allow reads on the 'reviews' collection.
                     <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                </AlertDescription>
            </Alert>
        )}
        {!loading && !error && reviews.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first to leave one!</p>
        )}
        {!loading && !error && reviews.map((review) => (
          <div key={review.id} className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={`https://placehold.co/40x40?text=${review.avatar}`} data-ai-hint="person portrait" />
                <AvatarFallback>{review.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-xs text-muted-foreground">{String(review.date)}</p>
                  </div>
                  <RatingInput rating={review.rating} readOnly />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-border">
          <p className="font-semibold text-lg">Leave a review</p>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
                <p className="text-sm font-medium mb-2">Your Rating</p>
                <RatingInput rating={newRating} onRate={setNewRating} />
            </div>
            <Textarea 
                placeholder="Share your experience with this supplier..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
            />
            <Button type="submit" size="sm" disabled={!newComment.trim() || newRating === 0 || !user}>Submit Review</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierProfileReviews;
