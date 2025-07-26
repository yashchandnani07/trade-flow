
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Role } from '@/lib/types';
import { Loader2 } from 'lucide-react';


export default function SignupPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, user, loading, sendOtp } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery && ['vendor', 'supplier', 'farmer'].includes(roleFromQuery)) {
      setRole(roleFromQuery as Role);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'supplier') {
        router.replace('/supplier-dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);


  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!role || !businessName) {
      toast({
        variant: 'destructive',
        title: 'Missing Details',
        description: 'Please fill out all fields.',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await sendOtp(phoneNumber);
      toast({ title: 'OTP Sent', description: 'Please check your phone for the verification code.' });
      setStep('otp');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message || 'Could not send verification code. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setIsSubmitting(true);
    try {
      await signup(otp, phoneNumber, { role, businessName });
      toast({ title: 'Signup successful!' });
      // Redirection is handled by the main auth listener
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div id="recaptcha-container"></div>
      <Card className="mx-auto max-w-sm bg-glass">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
             {step === 'details' ? 'Enter your information to create an account' : 'Enter the OTP to verify your number'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'details' ? (
            <form onSubmit={handleSendOtp} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input id="business-name" placeholder="Acme Inc." required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 123 456 7890" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as Role)} required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="farmer">Farmer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </form>
          ) : (
             <form onSubmit={handleSignup} className="grid gap-4">
               <div className="grid gap-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input id="otp" type="text" inputMode="numeric" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)} />
               </div>
               <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
               </Button>
                <Button variant="link" size="sm" onClick={() => setStep('details')}>
                    Back to details
                </Button>
             </form>
          )}

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
