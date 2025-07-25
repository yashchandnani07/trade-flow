'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { SupplierView } from './supplier/supplier-view';
import { RestaurantView } from './restaurant/restaurant-view';
import { Building, Wheat } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function App() {
  const [isSupplier, setIsSupplier] = React.useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 flex justify-between items-center border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Trade Flow</h1>
        <div className="flex items-center gap-4">
          <Button
            variant={isSupplier ? 'default' : 'ghost'}
            onClick={() => setIsSupplier(true)}
          >
            <Wheat className="mr-2 h-4 w-4" /> Supplier
          </Button>
          <Button
            variant={!isSupplier ? 'default' : 'ghost'}
            onClick={() => setIsSupplier(false)}
          >
            <Building className="mr-2 h-4 w-4" /> Restaurant
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <main className="p-4">
        {isSupplier ? <SupplierView /> : <RestaurantView />}
      </main>
    </div>
  );
}
