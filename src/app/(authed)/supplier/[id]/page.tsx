
'use client';
import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { type Supplier } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import SupplierProfileReviews from './components/supplier-profile-reviews';
import { notFound, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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


export default function SupplierProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supplierRef = useMemo(() => doc(db, 'users', params.id), [params.id]);
  const [supplier, loading, error] = useDocumentData(supplierRef, { idField: 'id' });

  const pageContent = () => {
    if (loading) {
      return (
          <div className="p-4 md:p-6 lg:p-8 space-y-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-6">
                      <Skeleton className="h-64 w-full rounded-xl" />
                      <Skeleton className="h-48 w-full rounded-xl" />
                  </div>
                  <div className="lg:col-span-2">
                       <Skeleton className="h-96 w-full rounded-xl" />
                  </div>
              </div>
          </div>
      );
    }

    if (error || !supplier) {
      if(error) console.error("Error fetching supplier:", error);
      // This will render the not-found.tsx file if it exists
      notFound();
    }

    const typedSupplier = supplier as Supplier;

    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
          <Button variant="outline" size="sm" onClick={() => router.push('/supplier')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Suppliers
          </Button>
          {/* Header section */}
          <Card className="bg-glass">
              <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                      <Avatar className="w-24 h-24 border-2 border-primary">
                          <AvatarImage src={`https://placehold.co/96x96?text=${typedSupplier.avatar}`} data-ai-hint="company logo" />
                          <AvatarFallback>{typedSupplier.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                          <h2 className="text-3xl font-bold">{typedSupplier.name}</h2>
                          <div className="flex items-center gap-2 mt-2">
                              <StarRating rating={typedSupplier.rating} />
                              <span className="text-muted-foreground">({typedSupplier.reviewCount} reviews)</span>
                          </div>
                          <p className="text-muted-foreground mt-2 max-w-prose">{typedSupplier.description}</p>
                      </div>
                  </div>
              </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column for details */}
              <div className="lg:col-span-1 space-y-6">
                  <Card className="bg-glass">
                      <CardHeader>
                          <CardTitle>Supplier Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                          <div className="flex items-start gap-3">
                              <Phone className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                              <span>{typedSupplier.contact.phone}</span>
                          </div>
                           <div className="flex items-start gap-3">
                              <Mail className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                              <span>{typedSupplier.contact.email}</span>
                          </div>
                          <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                              <span>{typedSupplier.location}</span>
                          </div>
                          <div className="flex items-start gap-3">
                              <Clock className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                              <span>{typedSupplier.hours}</span>
                          </div>
                      </CardContent>
                  </Card>
                   <Card className="bg-glass">
                      <CardHeader>
                          <CardTitle>Products & Services</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                          {typedSupplier.offerings.map(offering => (
                              <Badge key={offering} variant="secondary">{offering}</Badge>
                          ))}
                      </CardContent>
                  </Card>
              </div>

              {/* Right column for reviews */}
              <div className="lg:col-span-2">
                  <SupplierProfileReviews supplierId={params.id} />
              </div>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {pageContent()}
    </div>
  )
}
