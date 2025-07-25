
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { mockReviews } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";

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
    const [reviews, setReviews] = useState<Review[]>(mockReviews);
    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && newRating > 0) {
            const newReview: Review = {
                id: (reviews.length + 1).toString(),
                author: "You",
                avatar: "AD",
                date: new Date().toLocaleDateString('en-CA'),
                rating: newRating,
                comment: newComment,
            };
            setReviews([newReview, ...reviews]);
            setNewComment("");
            setNewRating(0);
        }
    };


  return (
    <Card className="h-full flex flex-col">
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
        {reviews.map((review) => (
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
