
'use client';
import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { type Supplier } from '@/lib/types';
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

const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
  <Card className="bg-glass hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
        <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border">
                <AvatarImage src={`https://placehold.co/64x64?text=${supplier.avatar}`} data-ai-hint="company logo" />
                <AvatarFallback>{supplier.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                 <CardTitle>{supplier.name}</CardTitle>
                 <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={supplier.rating} />
                    <span className="text-sm text-muted-foreground">({supplier.reviewCount} reviews)</span>
                </div>
            </div>
        </div>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm mb-4 h-10 overflow-hidden">{supplier.description}</p>
      <Button asChild className="w-full">
        <Link href={`/supplier/${supplier.id}`}>View Profile</Link>
      </Button>
    </CardContent>
  </Card>
);

export default function SupplierListPage() {
    const suppliersCollection = useMemo(() => collection(db, 'suppliers'), []);
    const q = useMemo(() => query(suppliersCollection), [suppliersCollection]);
    const [suppliers, loading, error] = useCollectionData(q, { idField: 'id' });

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Browse Suppliers</h2>
       {error && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Suppliers</AlertTitle>
            <AlertDescription>
                 There was a problem fetching suppliers. This is often due to Firestore security rules. Please check the `firestore.rules` file and update your project's rules in the Firebase console.
                <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
            </AlertDescription>
        </Alert>
       )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && [...Array(8)].map((_, i) => <Skeleton key={i} className="h-[250px] w-full" />)}
        {suppliers?.map(supplier => (
            <SupplierCard key={supplier.id} supplier={supplier as Supplier} />
        ))}
        {!loading && !error && (!suppliers || suppliers.length === 0) && (
             <Card className="col-span-full bg-glass">
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p>No suppliers found in the database.</p>
                    <p className="text-sm mt-2">Try seeding the database from the main dashboard to add some sample suppliers.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </main>
  );
}
