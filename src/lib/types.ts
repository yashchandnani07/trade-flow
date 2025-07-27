
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

/**
 * Represents a bid requirement posted by a vendor in the marketplace.
 * @property {string} id - The unique identifier for the bid.
 * @property {string} vendorId - The UID of the vendor who posted the bid.
 * @property {string} vendorName - The business name of the vendor.
 * @property {string} item - The description of the item required.
 * @property {number} quantity - The amount of the item required.
 * @property {number} targetPrice - The vendor's target price per unit.
 * @property {'open' | 'closed'} status - The current status of the bid.
 * @property {Timestamp} createdAt - The timestamp of when the bid was created.
 * @property {string} [acceptedProposalId] - The ID of the proposal that was accepted.
 */
export type Bid = {
    id: string;
    vendorId: string;
    vendorName: string;
    item: string;
    quantity: number;
    targetPrice: number;
    status: 'open' | 'closed';
    createdAt: Timestamp;
    acceptedProposalId?: string;
};

/**
 * Represents a proposal submitted by a supplier in response to a bid requirement.
 * @property {string} id - The unique identifier for the proposal.
 * @property {string} bidId - The ID of the bid this proposal is for.
 * @property {string} supplierId - The UID of the supplier who submitted the proposal.
 * @property {string} supplierName - The business name of the supplier.
 * @property {number} price - The price offered by the supplier.
 * @property {'pending' | 'accepted' | 'rejected'} status - The status of the proposal.
 * @property {Timestamp} createdAt - The timestamp of when the proposal was created.
 */
export type Proposal = {
    id: string;
    bidId: string;
    supplierId: string;
    supplierName: string;
    price: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Timestamp;
};
