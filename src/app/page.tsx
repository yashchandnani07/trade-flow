
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Truck, Leaf, Loader2 } from 'lucide-react';
import Link from 'next/link';

const roles = [
  {
    name: 'Vendor',
    description: 'Manage your street food stall, track sales, and connect with suppliers.',
    icon: <ShoppingCart className="w-12 h-12 text-primary" />,
    href: '/signup?role=vendor',
  },
  {
    name: 'Supplier',
    description: 'Provide fresh ingredients and supplies to local food vendors.',
    icon: <Truck className="w-12 h-12 text-primary" />,
    href: '/signup?role=supplier',
  },
  {
    name: 'Farmer',
    description: 'Cultivate and sell fresh produce directly to suppliers and vendors.',
    icon: <Leaf className="w-12 h-12 text-primary" />,
    href: '/signup?role=farmer',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Truck className="h-6 w-6" />
          <span className="sr-only">TradeFlow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/login"
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/1920x1080?text=Abstract+Food')" }} data-ai-hint="abstract food illustration">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center text-white bg-black/50 p-8 rounded-lg">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Connecting Pune's Street Food Ecosystem
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                Join our network to streamline your business, from farm to stall.
              </p>
              <Button asChild size="lg">
                <Link href="/signup">Join Now</Link>
              </Button>
            </div>
          </div>
        </section>
        <section id="roles" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Choose Your Role
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Are you a Vendor, Supplier, or Farmer?
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Select the role that best describes you to get started with a tailored experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roles.map((role) => (
                <Card key={role.name} className="glassmorphic p-4 rounded-[8px] hover:shadow-primary/20 hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="items-center">
                    {role.icon}
                    <CardTitle className="mt-4">{role.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription>{role.description}</CardDescription>
                  </CardContent>
                  <div className="flex justify-center p-4">
                     <Button asChild className="w-full">
                        <Link href={role.href}>Sign up as a {role.name}</Link>
                     </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2024 TradeFlow. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
