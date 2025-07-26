
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MountainIcon, BotIcon, ShipIcon, ShoppingCartIcon, StarIcon } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <MountainIcon className="h-6 w-6" />
          <span className="sr-only">TradeFlow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Testimonials
          </Link>
          <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Contact
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <Image
                src="https://placehold.co/600x400.png"
                width="550"
                height="550"
                alt="Hero"
                data-ai-hint="supply chain logistics"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Streamline Your Supply Chain with TradeFlow
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our AI-powered platform helps you manage suppliers, track orders, and optimize your operations.
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-2">
                  <form className="flex space-x-2">
                    <Input type="email" placeholder="Enter your email" className="max-w-lg flex-1" />
                    <Button type="submit">Get Started</Button>
                  </form>
                  <p className="text-xs text-muted-foreground">
                    Sign up to get started.
                    <Link href="/signup" className="underline underline-offset-2" prefetch={false}>
                      Terms & Conditions
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Powerful Tools to Optimize Your Supply Chain
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  TradeFlow provides a comprehensive suite of features to help you manage your suppliers, track orders,
                  and make data-driven decisions.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
               <Image
                src="https://placehold.co/600x400.png"
                width="550"
                height="310"
                alt="Feature"
                 data-ai-hint="dashboard charts"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Supplier Management</h3>
                      <p className="text-muted-foreground">
                        Keep track of your suppliers, contracts, and performance all in one place.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Order Tracking</h3>
                      <p className="text-muted-foreground">
                        Get real-time updates on your orders, from placement to delivery.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">AI-Powered Analytics</h3>
                      <p className="text-muted-foreground">
                        Leverage our AI to identify trends, predict delays, and optimize your supply chain.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                What Our Customers Are Saying
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from businesses who have transformed their supply chain with TradeFlow.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                     <Image
                      src="https://placehold.co/40x40.png"
                      width="40"
                      height="40"
                      alt="Avatar"
                      className="rounded-full"
                      data-ai-hint="person portrait"
                    />
                    <div>
                      <CardTitle>Sarah Johnson</CardTitle>
                      <CardDescription>CEO, Acme Inc.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "TradeFlow has been a game-changer for our business. We've been able to streamline our operations
                    and save thousands of dollars in the process."
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-muted-foreground" />
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                     <Image
                      src="https://placehold.co/40x40.png"
                      width="40"
                      height="40"
                      alt="Avatar"
                      className="rounded-full"
                      data-ai-hint="person portrait"
                    />
                    <div>
                      <CardTitle>David Lee</CardTitle>
                      <CardDescription>Supply Chain Manager, Globex Corp.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "The AI-powered analytics have been invaluable. We're now able to make much more informed
                    decisions and have seen a significant improvement in our efficiency."
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-primary" />
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Image
                      src="https://placehold.co/40x40.png"
                      width="40"
                      height="40"
                      alt="Avatar"
                      className="rounded-full"
                      data-ai-hint="person portrait"
                    />
                    <div>
                      <CardTitle>Emily Chen</CardTitle>
                      <CardDescription>Founder, EcoGoods</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "As a small business, TradeFlow has leveled the playing field for us. We can now compete with
                    larger companies on a much more even footing."
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-primary" />
                    <StarIcon className="h-5 w-5 fill-muted-foreground" />
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Get in Touch</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Have a question or want to learn more? Fill out the form below and we'll be in touch.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <form className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea id="message" placeholder="Enter your message" className="w-full h-32 p-2 border rounded-md" />
                </div>
                <Button type="submit">Send Message</Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 TradeFlow. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

    