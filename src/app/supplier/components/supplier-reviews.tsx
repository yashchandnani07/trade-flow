'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/types';


const Rating = ({ rating, onRate, readOnly = false }: { rating: number, onRate?: (rating: number) => void, readOnly?: boolean }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={cn(
            "w-4 h-4",
            i < rating ? 'text-primary fill-primary' : 'text-muted-foreground/50',
            !readOnly && "cursor-pointer"
        )}
        onClick={() => onRate && onRate(i + 1)}
      />
    ))}
  </div>
);

const SupplierReviews = () => {
    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(0);

    const reviewsCollection = useMemo(() => collection(db, 'reviews'), []);
    const reviewsQuery = useMemo(() => query(reviewsCollection, orderBy("date", "desc")), [reviewsCollection]);
    const [reviewsSnapshot, loading, error] = useCollection(reviewsQuery);

    const reviews: Review[] = useMemo(() => {
        if (!reviewsSnapshot) return [];
        return reviewsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                author: data.author,
                avatar: data.avatar,
                date: data.date ? new Date(data.date.seconds * 1000).toLocaleDateString('en-CA') : 'Date not available',
                rating: data.rating,
                comment: data.comment,
            };
        });
    }, [reviewsSnapshot]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && newRating > 0) {
            try {
                await addDoc(collection(db, "reviews"), {
                    author: "Anonymous Vendor",
                    avatar: "AV",
                    date: serverTimestamp(),
                    rating: newRating,
                    comment: newComment,
                });
                setNewComment("");
                setNewRating(0);
            } catch (e) {
                console.error("Error adding document: ", e);
            }
        }
    };

  return (
    <Card className="bg-glass">
      <CardHeader>
        <CardTitle>Supplier Reviews</CardTitle>
        <CardDescription>Feedback from recent transactions</CardDescription>
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
        {error && <p className="text-destructive text-sm">Error: Could not load reviews. Ensure Firestore is set up correctly and security rules allow reads.</p>}
        {!loading && !error && reviews.map((review) => (
          <div key={review.id} className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={`https://placehold.co/40x40?text=${review.avatar}`} />
                <AvatarFallback>{review.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  <Rating rating={review.rating} readOnly />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border">
          <p className="font-semibold">Leave a review</p>
          <form onSubmit={handleSubmit} className="space-y-2 mt-2">
            <Rating rating={newRating} onRate={setNewRating} />
            <Textarea 
                placeholder="Share your experience..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
            />
            <Button type="submit" size="sm" disabled={!newComment.trim() || newRating === 0}>Submit Review</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierReviews;
