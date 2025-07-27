
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, Trash2, Package, CalendarIcon } from 'lucide-react';
import { useState, FormEvent, useEffect, useCallback } from 'react';
import { collection, addDoc, serverTimestamp, query, where, orderBy, deleteDoc, doc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { StockItem } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FirebaseError } from "firebase/app";


function DeleteConfirmationDialog({ item, onConfirm, isDeleting }: { item: StockItem, onConfirm: () => void, isDeleting: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-glass">
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the item
                        <span className="font-bold"> {item.name} </span>
                        from your stock basket.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="button" onClick={handleConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function VendorStockBasket() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchStockItems = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        };
        setLoading(true);
        try {
            const stockCollectionRef = collection(db, 'stockItems');
            const stockQuery = query(stockCollectionRef, where("ownerId", "==", user.uid), orderBy("expiryDate", "asc"));
            const querySnapshot = await getDocs(stockQuery);
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockItem));
            setStockItems(items);
        } catch (e) {
            console.error(e);
            setError(e as Error);
            toast({
                variant: 'destructive',
                title: 'Failed to load stock',
                description: 'Could not fetch stock items. This may be due to missing Firestore security rules.'
            });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchStockItems();
    }, [fetchStockItems]);

    const handleAddItem = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !itemName || !quantity || !expiryDate) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const stockCollectionRef = collection(db, 'stockItems');
            const newDocData = {
                name: itemName,
                quantity: Number(quantity),
                expiryDate: Timestamp.fromDate(new Date(expiryDate)),
                ownerId: user.uid,
                createdAt: serverTimestamp(),
            };

            await addDoc(stockCollectionRef, newDocData);
            
            // Refetch after adding
            await fetchStockItems();

            toast({ title: 'Item Added', description: `${itemName} has been added to your stock basket.` });
            setIsOpen(false);
            setItemName('');
            setQuantity('');
            setExpiryDate('');
        } catch (error) {
            console.error('Error adding stock item:', error);
            const isPermissionError = error instanceof FirebaseError && (error.code === 'permission-denied' || error.code === 'unauthenticated');
            toast({ 
                variant: 'destructive', 
                title: "Error adding item", 
                description: isPermissionError
                    ? "You do not have permission to add this item. Please check Firestore rules."
                    : "Could not add stock item."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (itemId: string) => {
        setDeletingId(itemId);
        try {
            await deleteDoc(doc(db, 'stockItems', itemId));
            setStockItems(prevItems => prevItems.filter(item => item.id !== itemId));
            toast({ title: "Item Removed", description: "The stock item has been removed from your basket." });
        } catch (error) {
            console.error("Error deleting item:", error);
            const isPermissionError = error instanceof FirebaseError && (error.code === 'permission-denied' || error.code === 'unauthenticated');
            toast({ 
                variant: 'destructive', 
                title: "Deletion Failed", 
                description: isPermissionError
                    ? "You do not have permission to delete this item. Please check Firestore rules."
                    : "Could not remove the item."
            });
        } finally {
            setDeletingId(null);
        }
    };
    
    return (
        <Card className="glassmorphic">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                    <CardTitle className="flex items-center gap-2">
                        <Package /> My Stock & Expiry
                    </CardTitle>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Stock Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-glass">
                        <DialogHeader>
                            <DialogTitle>Add New Stock Item</DialogTitle>
                            <DialogDescription>Enter the details for the new stock item.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddItem}>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="item-name">Item Name</Label>
                                    <Input id="item-name" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Organic Apples" required />
                                </div>
                                <div>
                                    <Label htmlFor="quantity">Quantity (units)</Label>
                                    <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 100" required />
                                </div>
                                <div>
                                    <Label htmlFor="expiry-date">Expiry Date</Label>
                                    <Input id="expiry-date" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Item
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && [...Array(3)].map((_, i) => (
                            <TableRow key={`skeleton-row-${i}`}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                            </TableRow>
                        ))}
                        {!loading && stockItems && stockItems.length > 0 ? (
                            stockItems.map(item => {
                                const daysUntilExpiry = differenceInDays(item.expiryDate.toDate(), new Date());
                                const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                                const isExpired = daysUntilExpiry <= 0;

                                let expiryVariant: "destructive" | "warning" | "default" = "default";
                                if (isExpired) expiryVariant = "destructive";
                                else if (isExpiringSoon) expiryVariant = "warning";
                                
                                let badgeVariant: "destructive" | "default" | undefined;
                                let badgeClass = "";
                                if (isExpired) {
                                    badgeVariant = "destructive";
                                } else if (isExpiringSoon) {
                                    badgeVariant = "default";
                                    badgeClass = "bg-yellow-500 hover:bg-yellow-600";
                                }

                                return (
                                    <TableRow key={item.id} className={cn(expiryVariant === 'warning' && 'bg-yellow-500/10', expiryVariant === 'destructive' && 'bg-destructive/10')}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4" />
                                                <span>{format(item.expiryDate.toDate(), 'PPP')}</span>
                                                 {badgeVariant && (
                                                    <Badge variant={badgeVariant} className={cn(badgeClass)}>
                                                        {isExpired ? 'Expired' : `in ${daysUntilExpiry}d`}
                                                    </Badge>
                                                 )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DeleteConfirmationDialog 
                                                item={item}
                                                onConfirm={() => handleDelete(item.id)}
                                                isDeleting={deletingId === item.id}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            !loading && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No stock items yet. Add one to get started.
                                </TableCell>
                            </TableRow>
                            )
                        )}
                         {error && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-destructive py-4">
                                     Error: {error.message}
                                </TableCell>
                            </TableRow>
                         )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
