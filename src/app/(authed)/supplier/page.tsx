
'use client';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { type User } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

const SupplierCard = ({ supplier }: { supplier: User }) => (
  <Card className="bg-glass hover:shadow-lg transition-shadow duration-300 flex flex-col">
    <CardHeader>
        <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border">
                <AvatarImage src={`https://placehold.co/64x64?text=${supplier.businessName?.[0]}`} data-ai-hint="company logo" />
                <AvatarFallback>{supplier.businessName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                 <CardTitle>{supplier.businessName}</CardTitle>
                 <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={supplier.points / 1000} /> 
                    <span className="text-sm text-muted-foreground">({supplier.points} points)</span>
                </div>
            </div>
        </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-muted-foreground text-sm mb-4 h-10 overflow-hidden">
          {/* Placeholder for description. User documents don't have this field yet. */}
          A leading supplier in the industry.
      </p>
    </CardContent>
    <CardFooter>
      <Button asChild className="w-full">
        <Link href={`/supplier/${supplier.uid}`}>View Profile</Link>
      </Button>
    </CardFooter>
  </Card>
);

export default function SupplierListPage() {
    const usersCollection = useMemo(() => collection(db, 'users'), []);
    const q = useMemo(() => query(usersCollection, where("role", "==", "supplier")), [usersCollection]);
    const [suppliers, loading, error] = useCollectionData(q, { idField: 'uid' });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Browse Suppliers</h2>
        <Button asChild>
            <Link href="/supplier/review">Leave a Review</Link>
        </Button>
      </div>
       {error && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Suppliers</AlertTitle>
            <AlertDescription>
                There was a problem fetching suppliers. This is often due to Firestore security rules. Please ensure your rules allow reads on the 'users' collection where role is 'supplier'.
                <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
            </AlertDescription>
        </Alert>
       )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && [...Array(8)].map((_, i) => <Skeleton key={i} className="h-[250px] w-full" />)}
        {!loading && suppliers?.map(supplier => (
            <SupplierCard key={supplier.uid} supplier={supplier as User} />
        ))}
        {!loading && !error && (!suppliers || suppliers.length === 0) && (
             <Card className="col-span-full bg-glass">
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p>No suppliers found in the database.</p>
                    <p className="text-sm mt-2">Try registering a new user with the 'supplier' role.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
