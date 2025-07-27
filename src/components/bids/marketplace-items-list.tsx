
'use client';

import { useBidding } from '@/hooks/use-bidding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gavel, AlertTriangle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { MarketplaceItem } from '@/lib/types';
import Image from 'next/image';
import { PlaceBidDialog } from './place-bid-dialog';
import { useAuth } from '@/hooks/use-auth';

function ItemCard({ item }: { item: MarketplaceItem }) {
    const { user } = useAuth();
    return (
        <Card className="flex flex-col bg-glass/80 backdrop-blur-lg overflow-hidden group">
            <div className="relative">
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={400}
                    height={200}
                    className="object-cover w-full h-40 group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={item.aiHint}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-xl font-bold text-white shadow-md">{item.name}</h3>
                    <p className="text-sm text-white/80">{item.category}</p>
                 </div>
            </div>
            <CardContent className="flex-grow p-4 space-y-2">
                <p className="text-sm">Listed by: <span className="font-semibold">{item.sellerName}</span></p>
                <p className="text-sm">Starting Price: <span className="text-lg font-bold text-primary">${item.currentPrice.toFixed(2)}</span></p>
            </CardContent>
            {user?.role === 'supplier' && (
                <div className="p-4 pt-0">
                    <PlaceBidDialog item={item} />
                </div>
            )}
        </Card>
    );
}


export function MarketplaceItemsList() {
    const { marketplaceItems, loading, error } = useBidding();
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Gavel /> Bidding Marketplace</h2>
                    <p className="text-muted-foreground">
                       Find items to bid on from various vendors.
                    </p>
                </div>
            </div>
             {error && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Marketplace</AlertTitle>
                    <AlertDescription>
                        There was a problem fetching items from the database. Please check your connection and Firestore security rules.
                         <pre className="mt-2 p-2 bg-muted rounded-md text-xs">{error.message}</pre>
                    </AlertDescription>
                </Alert>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={`item-skeleton-${i}`} className="h-80" />)}
                </div>
            )}

            {!loading && marketplaceItems.length === 0 && !error && (
                <Card className="bg-glass">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No items found in the marketplace.
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!loading && marketplaceItems.map(item => {
                    if (!item?.id) return null;
                    return <ItemCard key={item.id} item={item} />;
                })}
            </div>
        </div>
    );
}
