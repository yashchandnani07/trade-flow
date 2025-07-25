'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Star, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import { Product } from '@/app/types/product';

interface ProductDetailModalProps {
  product: Product;
  onOpenChange: (isOpen: boolean) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onOpenChange,
}) => {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] bg-secondary rounded-lg shadow-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detailed information about the product.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative h-60 w-full rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              data-ai-hint="product image"
            />
          </div>
          <div className="space-y-4">
            <p className="text-lg text-foreground">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary">
                ₹{product.price}/kg
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Star className="w-6 h-6 text-yellow-500" />
                <span className="font-semibold text-foreground">
                  {product.rating}/5
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{product.farmLocation}</span>
              </div>
              <div
                className={`flex items-center gap-2 font-medium ${
                  product.stock < 100 ? 'text-red-500' : 'text-green-500'
                }`}
              >
                <span>Stock: {product.stock} kg</span>
              </div>
              {product.expiryDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>Expires on: {product.expiryDate}</span>
                </div>
              )}
              {product.isFssaiCertified && (
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  <ShieldCheck className="h-5 w-5" />
                  <span>FSSAI Certified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
