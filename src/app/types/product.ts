export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  rating: number;
  imageUrl: string;
  description: string;
  farmLocation: string;
  isFssaiCertified: boolean;
  expiryDate?: string;
};
