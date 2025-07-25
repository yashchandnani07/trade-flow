'use client';
import { useState } from 'react';
import {
  Archive,
  Bell,
  Flame,
  Gauge,
  Home,
  Search,
  Send,
  Settings,
  User,
  Wallet,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import SupplierPage from '@/app/supplier/page';

type View = 'vendor' | 'supplier';

const Sidebar = () => (
  <aside className="w-16 flex flex-col items-center space-y-6 py-4 bg-card-gradient border-r border-border">
    <div className="p-2 bg-primary/10 rounded-lg text-primary">
      <Wallet size={24} />
    </div>
    <nav className="flex flex-col items-center space-y-6">
      <Button variant="ghost" size="icon" className="text-primary bg-primary/10 rounded-lg">
        <Home size={20} />
      </Button>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Gauge size={20} />
      </Button>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Archive size={20} />
      </Button>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <User size={20} />
      </Button>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Send size={20} />
      </Button>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Settings size={20} />
      </Button>
    </nav>
  </aside>
);

const Header = ({
  view,
  setView,
}: {
  view: View;
  setView: (view: View) => void;
}) => (
  <header className="flex items-center justify-between p-4 border-b border-border">
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-semibold">Trade Flow</h1>
      <div className="flex items-center bg-card p-1 rounded-full">
        <Button
          variant={view === 'vendor' ? 'secondary' : 'ghost'}
          size="sm"
          className="rounded-full"
          onClick={() => setView('vendor')}
        >
          Vendor
        </Button>
        <Button
          variant={view === 'supplier' ? 'secondary' : 'ghost'}
          size="sm"
          className="rounded-full"
          onClick={() => setView('supplier')}
        >
          Supplier
        </Button>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="relative w-64">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input placeholder="Search..." className="pl-10 bg-card border-none" />
      </div>
      <ThemeToggle />
      <Avatar>
        <AvatarImage data-ai-hint="avatar" src="https://placehold.co/36x36.png" alt="User" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  </header>
);

const VendorDashboard = () => (
  <div className="p-6 space-y-6">
    <h2 className="text-2xl font-bold">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-card-gradient">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Vendor Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">2,847</div>
          <Progress value={75} className="mt-4 h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            75% to next reward tier
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card-gradient">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Performance Streak
          </CardTitle>
          <Flame className="text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">23 <span className="text-2xl text-muted-foreground">Days</span></div>
          <p className="text-xs text-muted-foreground mt-2">
            Keep up the excellent work!
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card-gradient flex flex-col items-center justify-center text-center p-4">
        <div className="relative h-24 w-24">
           <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-muted"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="text-primary"
              strokeDasharray="94, 100"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
            94%
          </div>
        </div>
        <CardTitle className="text-sm font-medium mt-2">
          Satisfaction Rating
        </CardTitle>
        <p className="text-xs text-muted-foreground">Based on 2,342 reviews</p>
      </Card>
      <Card className="bg-card-gradient">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            AI Alerts
          </CardTitle>
           <div className="relative">
             <Bell className="text-blue-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white">3</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">3 <span className="text-2xl text-muted-foreground">New</span></div>
          <p className="text-xs text-muted-foreground mt-2">
            New insights available
          </p>
        </CardContent>
      </Card>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        <Card className="bg-card-gradient">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-lg">
                <Archive size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold">Order #001</p>
                <p className="text-sm text-muted-foreground">Quantum Supplies</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">$350.75</p>
              <p className="text-sm text-muted-foreground">2 days ago</p>
            </div>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">Shipped</Badge>
          </CardContent>
        </Card>
        <Card className="bg-card-gradient">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-lg">
                <Archive size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold">Order #002</p>
                <p className="text-sm text-muted-foreground">Nexus Components</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">$1250.00</p>
              <p className="text-sm text-muted-foreground">1 week ago</p>
            </div>
             <Badge variant="outline" className="text-green-400 border-green-400/50">Delivered</Badge>
          </CardContent>
        </Card>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Order Timeline</h3>
        <Card className="bg-card-gradient mt-4 p-4">
            <CardTitle className="text-base font-semibold">Track Your Order</CardTitle>
            <CardDescription>Order #A0K-425</CardDescription>
            <div className="text-right">
                <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                <p className="font-semibold">June 24, 2024</p>
            </div>
            <div className="mt-4 flex items-center gap-4 p-4 bg-secondary rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Archive size={20} className="text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <p className="font-semibold">In Production</p>
                </div>
            </div>
        </Card>
      </div>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<View>('vendor');

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header view={view} setView={setView} />
        <main className="flex-1 overflow-y-auto">
          {view === 'vendor' ? <VendorDashboard /> : <SupplierPage />}
        </main>
      </div>
    </div>
  );
}
