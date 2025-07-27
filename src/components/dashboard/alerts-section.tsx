
'use client';
import { useMemo } from 'react';
import { collection, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { differenceInDays, format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, BadgeCheck, Bell, CalendarIcon, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { StockItem } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';


export function AlertsSection() {
    const { user } = useAuth();
    
    const stockCollection = useMemo(() => collection(db, 'stockItems'), []);

    const thirtyDaysFromNow = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return Timestamp.fromDate(date);
    }, []);
    
    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0); // Set to start of today
        return Timestamp.fromDate(date);
    }, []);

    const alertsQuery = useMemo(() => {
        if (!user) return null;
        // Sorting is removed from the query to avoid needing the index.
        // It will be sorted on the client-side.
        return query(
            stockCollection, 
            where("ownerId", "==", user.uid),
            where("expiryDate", ">=", today),
            where("expiryDate", "<=", thirtyDaysFromNow)
        );
    }, [stockCollection, user, today, thirtyDaysFromNow]);

    const [expiringItems, loading, error] = useCollectionData(alertsQuery, { idField: 'id' });
    
    // Sort the items on the client-side
    const sortedExpiringItems = useMemo(() => {
        if (!expiringItems) return [];
        return [...expiringItems].sort((a, b) => {
            const dateA = (a.expiryDate as Timestamp).toDate();
            const dateB = (b.expiryDate as Timestamp).toDate();
            return dateA.getTime() - dateB.getTime();
        });
    }, [expiringItems]);

    const renderContent = () => {
        if (loading) {
            return <Skeleton className="h-24 w-full" />
        }

        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Alerts</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            );
        }

        if (sortedExpiringItems && sortedExpiringItems.length === 0) {
            return (
                <Alert variant="default" className="bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>All Good!</AlertTitle>
                    <AlertDescription>No items are expiring in the next 30 days.</AlertDescription>
                </Alert>
            );
        }

        return (
            <div className="space-y-3 max-h-48 overflow-y-auto">
                {sortedExpiringItems && sortedExpiringItems.map(itemData => {
                    const item = itemData as StockItem;
                    const daysUntilExpiry = differenceInDays(item.expiryDate.toDate(), new Date());
                     let alertVariant: "destructive" | "warning" | "default" = "default";
                     if (daysUntilExpiry <= 7) alertVariant = "warning";
                     if (daysUntilExpiry < 1) alertVariant = "destructive";

                    return (
                        <Alert key={item.id} variant={alertVariant === 'warning' ? 'default' : alertVariant} className={cn(alertVariant === 'warning' && 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400', alertVariant === 'destructive' && 'border-destructive/50 text-destructive')}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="font-semibold">Expiring Soon: {item.name}</AlertTitle>
                            <AlertDescription>
                                {daysUntilExpiry < 1 ? `This item expired today.` : `Expires in ${daysUntilExpiry} days on ${format(item.expiryDate.toDate(), 'PPP')}.`}
                            </AlertDescription>
                        </Alert>
                    )
                })}
            </div>
        )

    }

    return (
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell />
                    Alerts
                </CardTitle>
                <CardDescription>
                    Notifications about items that need your attention.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
