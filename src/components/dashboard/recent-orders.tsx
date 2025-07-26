
'use client';
import { useMemo } from 'react';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Order } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '../ui/skeleton';

const statusVariantMap = {
    'Order Placed': "secondary",
    'Shipped': "default",
    'Received': "default"
} as const;

export function RecentOrders() {
    const { user } = useAuth();
    
    const ordersCollection = useMemo(() => collection(db, 'orders'), []);
    const ordersQuery = useMemo(() => {
        if (!user) return null;
        return query(ordersCollection, where("vendorId", "==", user.uid), orderBy("orderDate", "desc"), limit(5));
    }, [ordersCollection, user]);
    
    const [orders, loading, error] = useCollectionData(ordersQuery, { idField: 'id' });

    return (
        <Card className="h-full flex flex-col glassmorphic">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    <span>Recent Orders</span>
                </CardTitle>
                <CardDescription>
                    Your most recent orders. Click to view tracking details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {loading && (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                 )}
                 {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Orders</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                 )}
                 {!loading && !error && orders && orders.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                    <TableCell>{order.supplierName}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariantMap[order.status as keyof typeof statusVariantMap] || 'outline'}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/orders/${order.id}`}>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No recent orders found.</p>
                    </div>
                 )}

            </CardContent>
        </Card>
    )
}
