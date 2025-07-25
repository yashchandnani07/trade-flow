import type { AiEnhancedAlertOutput } from "@/ai/flows/ai-enhanced-alerts";

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
  author: string;
  avatar: string;
  date: string;
  rating: number;
  comment: string;
};

export type Alert = AiEnhancedAlertOutput & {
  id: string;
  read: boolean;
};
