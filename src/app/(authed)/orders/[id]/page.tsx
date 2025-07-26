
'use client';
import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { type Order } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { OrderTracker } from '@/components/orders/order-tracker';
import { OrderReview } from '@/components/orders/order-review';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const orderRef = useMemo(() => doc(db, 'orders', params.id), [params.id]);
  const [order, loading, error] = useDocumentData(orderRef, { idField: 'id' });

  const typedOrder = order as Order | undefined;
  const isSupplier = user?.uid === typedOrder?.supplierId;
  const isVendor = user?.uid === typedOrder?.vendorId;

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !typedOrder) {
    if (error) console.error("Error fetching order:", error);
    notFound();
  }
  
  // Security check
  if (!isSupplier && !isVendor) {
      notFound();
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <OrderTracker order={typedOrder} isSupplier={isSupplier} />
      
      {isVendor && typedOrder.status === 'Received' && (
        <OrderReview order={typedOrder} />
      )}
    </div>
  );
}
