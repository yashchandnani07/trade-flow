'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Sparkles, Star } from 'lucide-react';
import ProductDetailModal from './product-detail-modal';
import { Product } from '@/app/types/product';

const products: Product[] = [
  {
    id: '1',
    name: 'Organic Chicken',
    price: 250,
    stock: 120,
    rating: 4.8,
    imageUrl: 'https://placehold.co/300x300.png',
    description: 'Fresh, free-range organic chicken, raised without antibiotics.',
    farmLocation: 'Pune, Maharashtra',
    isFssaiCertified: true,
    expiryDate: '2024-12-15',
  },
  {
    id: '2',
    name: 'Basmati Rice',
    price: 150,
    stock: 500,
    rating: 4.9,
    imageUrl: 'https://placehold.co/300x300.png',
    description: 'Premium quality long-grain Basmati rice, aged for 2 years.',
    farmLocation: 'Dehradun, Uttarakhand',
    isFssaiCertified: true,
    expiryDate: '2025-10-20',
  },
  {
    id: '3',
    name: 'Turmeric Powder',
    price: 80,
    stock: 300,
    rating: 4.7,
    imageUrl: 'https://placehold.co/300x300.png',
    description: 'High-curcumin turmeric powder with a rich aroma and color.',
    farmLocation: 'Erode, Tamil Nadu',
    isFssaiCertified: false,
    expiryDate: '2025-08-01',
  },
  {
    id: '4',
    name: 'Mutton',
    price: 500,
    stock: 50,
    rating: 4.6,
    imageUrl: 'https://placehold.co/300x300.png',
    description: 'Tender and juicy mutton from grass-fed goats.',
    farmLocation: 'Jaipur, Rajasthan',
    isFssaiCertified: true,
    expiryDate: '2024-11-30',
  },
];

const ProductCard: React.FC<{
  product: Product;
  onViewDetails: (product: Product) => void;
}> = ({ product, onViewDetails }) => (
  <div className="relative group overflow-hidden rounded-lg bg-glass border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="absolute -top-1 -left-1 w-16 h-16 bg-blue-400/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500"></div>
    <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-pink-400/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500"></div>

    <div className="p-4 relative z-10">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-white">{product.name}</h3>
        {product.isFssaiCertified && (
          <div className="relative">
            <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
            <div className="absolute inset-0 bg-yellow-400/50 rounded-full blur-md animate-ping"></div>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-300">₹{product.price}/kg</p>
      <p
        className={`text-sm mt-1 ${
          product.stock < 100 ? 'text-red-400 animate-pulse' : 'text-gray-300'
        }`}
      >
        Stock: {product.stock} kg
      </p>
      <div className="flex items-center mt-2">
        <Star className="w-4 h-4 text-yellow-400 mr-1" />
        <span className="text-sm text-gray-200">{product.rating}/5</span>
      </div>
       {product.expiryDate && (
        <p className="text-xs text-gray-400 mt-1">
          Expires on: {product.expiryDate}
        </p>
      )}
      <Button
        className="w-full mt-4 bg-white/20 text-white backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all"
        onClick={() => onViewDetails(product)}
      >
        View Details
      </Button>
    </div>
    <div className="absolute inset-0 border-2 border-transparent rounded-lg group-hover:border-blue-400/50 transition-all duration-300 pointer-events-none"></div>
  </div>
);

export const ProductDiscovery = () => {
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );

  return (
    <div className="p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={setSelectedProduct}
          />
        ))}
      </div>
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
