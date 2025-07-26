
'use server';
import type { AiEnhancedAlertOutput } from "@/ai/flows/ai-enhanced-alerts";
import type { Timestamp, GeoPoint } from "firebase/firestore";

export type Order = {
  id: string;
  vendorId: string;
  supplierId: string;
  items: any[];
  status: "pending" | "shipped" | "delivered" | "cancelled";
  deliveryTimestamp: Timestamp | null;
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

export type Supplier = {
    id: string;
    name: string;
    description: string;
    rating: number;
    reviewCount: number;
    contact: {
        phone: string;
        email: string;
    };
    location: string;
    offerings: string[];
    hours: string;
    avatar: string;
};


export type Alert = AiEnhancedAlertOutput & {
  id: string;
  read: boolean;
};


export type Role = 'vendor' | 'supplier' | 'farmer';

export interface User {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  role: Role;
  businessName: string;
  fssaiStatus: 'pending' | 'verified';
  location: GeoPoint | null;
  points: number;
}

export type Bid = {
  id: string;
  vendorId: string;
  vendorName: string;
  item: string;
  quantity: number;
  targetPrice: number;
  status: 'active' | 'closed' | 'awarded';
  createdAt: Timestamp;
};

export type Proposal = {
  id: string;
  supplierId: string;
  supplierName: string;
  bidAmount: number;
  createdAt: Timestamp;
  status: 'pending' | 'accepted' | 'rejected';
};
