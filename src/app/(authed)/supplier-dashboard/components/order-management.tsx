
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMemo } from "react";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/lib/types";
import { Truck } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function OrderManagement() {
    const { user } = useAuth();
    
    const ordersCollection = useMemo(() => collection(db, 'orders'), []);
    const ordersQuery = useMemo(() => {
        if (!user) return null;
        // Query for orders where the current user is the supplier
        return query(ordersCollection, where("supplierId", "==", user.uid), orderBy("orderDate", "desc"), limit(5));
    }, [ordersCollection, user]);
    
    const [orders, loading, error] = useCollectionData(ordersQuery, { idField: 'id' });

    return (
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck /> Recent Orders Received
                </CardTitle>
                <CardDescription>Manage incoming orders from vendors.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {loading && [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                            </TableRow>
                        ))}
                        {orders && orders.map(orderData => {
                             const order = orderData as Order;
                             return (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                    <TableCell>{order.vendorId}</TableCell> {/* Placeholder, ideally we'd fetch vendor name */}
                                    <TableCell><Badge>{order.status}</Badge></TableCell>
                                    <TableCell>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/orders/${order.id}`}>Manage</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {!loading && (!orders || orders.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No recent orders.
                                </TableCell>
                            </TableRow>
                        )}
                        {error && (
                             <TableRow>
                                <TableCell colSpan={4} className="text-destructive text-center h-24">
                                    Error loading orders: {error.message}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
