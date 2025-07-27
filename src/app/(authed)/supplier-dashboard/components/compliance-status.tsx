
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert, ShieldCheck, CalendarIcon, Edit, Loader2, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useState, FormEvent, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function ComplianceStatus() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    useEffect(() => {
        if (user?.fssaiLicense) {
            setLicenseNumber(user.fssaiLicense.number);
            setExpiryDate(format(user.fssaiLicense.expiryDate.toDate(), 'yyyy-MM-dd'));
        }
    }, [user]);

    if (loading) {
        return <Skeleton className="h-48 w-full" />;
    }

    const license = user?.fssaiLicense;
    const daysUntilExpiry = license ? differenceInDays(license.expiryDate.toDate(), new Date()) : 0;
    const isExpiringSoon = daysUntilExpiry <= 5 && daysUntilExpiry > 0;
    const isExpired = daysUntilExpiry <= 0;

    let alertVariant: "default" | "destructive" | "warning" = "default";
    if (isExpired) {
        alertVariant = "destructive";
    } else if (isExpiringSoon) {
        alertVariant = "warning";
    }

    const handleUpdateLicense = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !licenseNumber || !expiryDate) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                fssaiLicense: {
                    number: licenseNumber,
                    expiryDate: Timestamp.fromDate(new Date(expiryDate))
                }
            });
            toast({ title: 'License Updated!', description: 'Your FSSAI license details have been saved.' });
            setIsOpen(false);
        } catch (error) {
            console.error('Error updating license:', error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save your license details.' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck /> FSSAI Compliance
                </CardTitle>
            </CardHeader>
            <CardContent>
                {license ? (
                    <div className="space-y-4">
                        {(isExpiringSoon || isExpired) && (
                            <Alert variant={alertVariant === 'warning' ? 'default' : alertVariant} className={alertVariant === 'warning' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : ''}>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>{isExpired ? 'License Expired!' : 'License Expiring Soon!'}</AlertTitle>
                                <AlertDescription>
                                    {isExpired 
                                        ? `Your license expired on ${format(license.expiryDate.toDate(), 'PPP')}.`
                                        : `Your license will expire in ${daysUntilExpiry} days.`
                                    }
                                    {' '}Please renew it immediately.
                                </AlertDescription>
                            </Alert>
                        )}
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">License Number</p>
                            <p className="font-semibold text-lg">{license.number}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                            <p className="font-semibold text-lg flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                {format(license.expiryDate.toDate(), 'PPP')}
                            </p>
                        </div>
                    </div>
                ) : (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No License Information</AlertTitle>
                        <AlertDescription>
                            Please add your FSSAI license details to ensure compliance.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                 <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <Edit className="mr-2 h-4 w-4" /> {license ? 'Update License' : 'Add License'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-glass">
                        <DialogHeader>
                            <DialogTitle>FSSAI License Details</DialogTitle>
                            <DialogDescription>
                                Enter your license number and expiry date.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateLicense}>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="license-number" className="text-sm font-medium">License Number</Label>
                                    <Input
                                        id="license-number"
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                        placeholder="Enter your FSSAI number"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="expiry-date" className="text-sm font-medium">Expiry Date</Label>
                                    <Input
                                        id="expiry-date"
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
}
