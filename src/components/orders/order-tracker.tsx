
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Package, Truck, CheckCircle, Upload, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const orderSteps: { status: OrderStatus; icon: React.ElementType; title: string; }[] = [
    { status: "Order Placed", icon: Package, title: "Order Placed" },
    { status: "Shipped", icon: Truck, title: "Shipped" },
    { status: "Received", icon: CheckCircle, title: "Received" },
];


export function OrderTracker({ order, isSupplier }: { order: Order; isSupplier: boolean; }) {
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);
    
    const currentStepIndex = orderSteps.findIndex(step => step.status === order.status);

    const handleUpdateStatus = async (newStatus: OrderStatus) => {
        setIsUpdating(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, { status: newStatus });
            toast({
                title: 'Order Status Updated',
                description: `Order moved to "${newStatus}"`,
            });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update order status.',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle>Order Tracking</CardTitle>
                <CardDescription>
                    Tracking details for order <span className="font-mono">{order.id}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Visual Tracker */}
                <div className="relative">
                    <div className="absolute left-5 top-5 h-full w-0.5 bg-border" />
                    {orderSteps.map((step, index) => (
                        <div key={step.status} className="flex items-start gap-4 relative mb-8">
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-full z-10",
                                index <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}>
                                <step.icon className="h-5 w-5" />
                            </div>
                            <div className="pt-1.5">
                                <p className={cn("font-semibold", index === currentStepIndex && "text-primary")}>{step.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {index === currentStepIndex ? 'Current status' : index < currentStepIndex ? 'Completed' : 'Pending'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Image Placeholders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pre-delivery Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.preDeliveryImage ? (
                                <Image src={order.preDeliveryImage} alt="Pre-delivery" width={400} height={300} className="rounded-lg object-cover" />
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center bg-muted rounded-lg">
                                    <p className="text-muted-foreground">No image uploaded</p>
                                    {isSupplier && <Button variant="outline" size="sm" className="mt-2"><Upload className="mr-2 h-4 w-4" /> Upload</Button>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Post-delivery Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.postDeliveryImage ? (
                                <Image src={order.postDeliveryImage} alt="Post-delivery" width={400} height={300} className="rounded-lg object-cover" />
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center bg-muted rounded-lg">
                                    <p className="text-muted-foreground">No image uploaded</p>
                                    {!isSupplier && <Button variant="outline" size="sm" className="mt-2"><Upload className="mr-2 h-4 w-4" /> Upload</Button>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
            {isSupplier && order.status !== 'Received' && (
                <CardFooter>
                    <div className="w-full">
                        <Alert>
                            <AlertTitle>Supplier Action</AlertTitle>
                            <AlertDescription>Update the order status once it has been shipped.</AlertDescription>
                        </Alert>
                        <Button 
                            className="mt-4 w-full" 
                            onClick={() => handleUpdateStatus('Shipped')}
                            disabled={isUpdating || order.status === 'Shipped'}
                        >
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Mark as Shipped
                        </Button>
                    </div>
                </CardFooter>
            )}
            {!isSupplier && order.status === 'Shipped' && (
                 <CardFooter>
                    <div className="w-full">
                        <Alert>
                            <AlertTitle>Action Required</AlertTitle>
                            <AlertDescription>Please confirm when you have received the order.</AlertDescription>
                        </Alert>
                        <Button 
                            className="mt-4 w-full"
                            onClick={() => handleUpdateStatus('Received')}
                            disabled={isUpdating}
                        >
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Mark as Received
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
