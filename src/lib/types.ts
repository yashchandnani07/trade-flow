
'use server';
import type { AiEnhancedAlertOutput } from "@/ai/flows/ai-enhanced-alerts";
import type { Timestamp } from "firebase/firestore";

export type Order = {
  id: string;
  product: string;
  customer: string;
  date: string;
  amount: string;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
};

export type Review = {
  id: string;
  supplierId: string;
  author: string;
  avatar: string;
  date: Timestamp | string; // Firestore timestamp or string
  rating: number;
  comment: string;
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
