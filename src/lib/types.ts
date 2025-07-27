
'use server';
import type { AiEnhancedAlertOutput } from "@/ai/flows/ai-enhanced-alerts";
import type { Timestamp, GeoPoint } from "firebase/firestore";

export type OrderStatus = 'Order Placed' | 'Shipped' | 'Received';

export type Order = {
  id: string;
  vendorId: string;
  supplierId: string;
  supplierName: string;
  items: any[];
  status: OrderStatus;
  orderDate: Timestamp;
  deliveryTimestamp: Timestamp | null;
  preDeliveryImage?: string | null;
  postDeliveryImage?: string | null;
  rating?: number;
  review?: string;
};

export type Review = {
  id: string;
  supplierId: string;
  vendorId: string;
  author: string;
  avatar: string;
  timestamp: Timestamp | string; // Firestore timestamp or string
  rating: number;
  comment: string;
  verified: boolean;
};

export type Alert = AiEnhancedAlertOutput & {
  id: string;
  read: boolean;
};

export type Role = 'vendor' | 'supplier' | 'farmer';

export type BadgeInfo = {
  name: string;
  dateAwarded: Timestamp;
};

export interface User {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  role: Role;
  businessName: string;
  fssaiStatus: 'pending' | 'verified' | 'expired';
  fssaiLicense?: {
    number: string;
    expiryDate: Timestamp;
  };
  location: GeoPoint | null;
  points: number;
  badges?: BadgeInfo[];
}

export type StockItem = {
    id: string;
    name: string;
    quantity: number;
    expiryDate: Timestamp;
    ownerId: string; // Changed from supplierId to be generic
}

export type DiaryEntry = {
  id: string;
  ownerId: string;
  content: string;
  createdAt: Timestamp;
};
