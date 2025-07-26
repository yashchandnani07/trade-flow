'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const reviews = [
  {
    initials: 'SJ',
    name: 'Sarah Johnson',
    date: '2024-05-20',
    rating: 5,
    comment: 'Exceptional quality and fantastic communication. The order arrived ahead of schedule. Will definitely work with them again!',
  },
  {
    initials: 'MC',
    name: 'Michael Chen',
    date: '2024-05-18',
    rating: 4,
    comment: 'Very reliable supplier. The products are consistent and pricing is competitive. Minor delay in the last shipment but they were proactive in communicating it.',
  },
  {
    initials: 'DG',
    name: 'David Garcia',
    date: '2024-05-12',
    rating: 5,
    comment: 'A pleasure to work with. They are always accommodating to our custom requests and deliver high-quality results every time. Highly recommended.',
  },
];

const Rating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-blue-500 fill-blue-500' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

const SupplierReviews = () => {
  return (
    <Card className="bg-card-gradient">
      <CardHeader>
        <CardTitle>Supplier Reviews</CardTitle>
        <CardDescription>Feedback from recent transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={index} className="flex items-start space-x-4">
              <Avatar>
                <AvatarFallback>{review.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  <Rating rating={review.rating} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border">
          <p className="font-semibold">Leave a review</p>
          <div className="flex items-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-gray-300 cursor-pointer" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierReviews;
