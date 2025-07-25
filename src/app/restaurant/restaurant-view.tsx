'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ProductDiscovery } from '../supplier/components/product-discovery';

export const RestaurantView = () => {
  return (
    <div className="space-y-8">
      <section className="bg-secondary p-8 rounded-lg">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Find the Freshest Ingredients
        </h2>
        <p className="text-muted-foreground mb-6">
          Search for products from top-rated suppliers.
        </p>
        <div className="flex w-full max-w-lg items-center space-x-2">
          <Input
            type="search"
            placeholder="Search for chicken, rice, etc..."
            className="flex-1"
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </section>

      <ProductDiscovery />
    </div>
  );
};
