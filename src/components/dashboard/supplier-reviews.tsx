
"use client";

import { useState, useMemo } from "react";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

function StarRating({ rating, className }: { rating: number, className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < Math.round(rating)
              ? "text-primary fill-primary"
              : "text-muted-foreground/50"
          )}
        />
      ))}
    </div>
  );
}

export function SupplierReviews() {
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
                // Convert Firestore Timestamp to a readable date string
                date: data.date ? new Date(data.date.seconds * 1000).toLocaleDateString('en-CA') : 'Date not available',
                rating: data.rating,
                comment: data.comment,
            };
        });
    }, [reviewsSnapshot]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && newRating > 0) {
            await addDoc(collection(db, "reviews"), {
                author: "You",
                avatar: "AD",
                date: serverTimestamp(),
                rating: newRating,
                comment: newComment,
            });
            setNewComment("");
            setNewRating(0);
        }
    };


  return (
    <Card className="h-full flex flex-col glassmorphic">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span>Supplier Reviews</span>
        </CardTitle>
        <CardDescription>
            Feedback from recent transactions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 overflow-y-auto">
        {loading && (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        )}
        {error && <p className="text-destructive">Error: {error.message}</p>}
        {!loading && !error && reviews.map((review) => (
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
              <p className="text-xs text-muted-foreground">{review.date}</p>
              <p className="text-sm mt-1">{review.comment}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 border-t pt-4">
        <p className="text-sm font-medium">Leave a review</p>
        <form onSubmit={handleSubmit} className="w-full space-y-2">
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <button type="button" key={i} onClick={() => setNewRating(i + 1)}>
                        <Star className={cn("w-5 h-5 cursor-pointer", i < newRating ? "text-primary fill-primary" : "text-muted-foreground/50")} />
                    </button>
                ))}
            </div>
            <Textarea 
                placeholder="Share your experience with the supplier..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
            />
            <Button type="submit" size="sm" disabled={!newComment.trim() || newRating === 0}>Submit Review</Button>
        </form>
      </CardFooter>
    </Card>
  );
}
