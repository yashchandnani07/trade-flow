
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import type { Bid, Proposal, Order } from '@/lib/types';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { Timestamp, collection, addDoc, getDocs, query, where, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Helper functions to interact with localStorage
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToLocalStorage = <T>(key: string, value: T) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};


interface BiddingContextType {
  bids: Bid[];
  proposals: Proposal[];
  loading: boolean;
  error?: Error;
  addBid: (newBidData: Omit<Bid, 'id' | 'status' | 'createdAt' | 'vendorId' | 'vendorName' | 'acceptedProposalId'>) => Promise<void>;
  deleteBid: (bidId: string) => Promise<void>;
  addProposal: (bidId: string, newProposalData: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'bidId' | 'supplierId' | 'supplierName'>) => Promise<void>;
  acceptProposal: (bidId: string, proposalId: string) => Promise<void>;
  getProposalsForBid: (bidId: string) => Proposal[];
}

const BiddingContext = createContext<BiddingContextType | undefined>(undefined);


export const BiddingProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [bids, setBids] = useState<Bid[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();

    useEffect(() => {
        setLoading(true);
        try {
            const storedBids = getFromLocalStorage<Bid[]>('bids', []);
            const storedProposals = getFromLocalStorage<Proposal[]>('proposals', []);
            // Convert date strings back to a format that can be used to create a Timestamp
            const parsedBids = storedBids.map(b => ({ ...b, createdAt: b.createdAt ? new Timestamp((b.createdAt as any).seconds, (b.createdAt as any).nanoseconds) : Timestamp.now() }));
            const parsedProposals = storedProposals.map(p => ({ ...p, createdAt: p.createdAt ? new Timestamp((p.createdAt as any).seconds, (p.createdAt as any).nanoseconds) : Timestamp.now() }));

            setBids(parsedBids);
            setProposals(parsedProposals);
        } catch(e) {
            setError(e as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        saveToLocalStorage('bids', bids);
    }, [bids]);

    useEffect(() => {
        saveToLocalStorage('proposals', proposals);
    }, [proposals]);


    const addBid = useCallback(async (newBidData: Omit<Bid, 'id' | 'status' | 'createdAt' | 'vendorId' | 'vendorName' | 'acceptedProposalId'>) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only vendors can post requirements.' });
            throw new Error('Permission Denied');
        }
        
        const newBid: Bid = {
            id: `bid_${Date.now()}`,
            ...newBidData,
            vendorId: user.uid,
            vendorName: user.businessName || 'Anonymous Vendor',
            status: 'open',
            createdAt: Timestamp.now(),
        };
        setBids(prev => [...prev, newBid]);

    }, [user, toast]);
    
    const deleteBid = useCallback(async (bidId: string) => {
       setBids(prev => prev.filter(b => b.id !== bidId));
       setProposals(prev => prev.filter(p => p.bidId !== bidId));
    }, []);

    const addProposal = useCallback(async (bidId: string, newProposalData: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'bidId' | 'supplierId' | 'supplierName'>) => {
        if (!user || user.role !== 'supplier') {
             toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only suppliers can submit proposals.' });
            throw new Error('Permission Denied');
        }
        
        const newProposal: Proposal = {
            id: `prop_${Date.now()}`,
            ...newProposalData,
            bidId,
            supplierId: user.uid,
            supplierName: user.businessName || 'Anonymous Supplier',
            status: 'pending',
            createdAt: Timestamp.now(),
        };

        setProposals(prev => [...prev, newProposal]);

    }, [user, toast]);

    const acceptProposal = useCallback(async (bidId: string, proposalId: string) => {
        const bid = bids.find(b => b.id === bidId);
        const proposal = proposals.find(p => p.id === proposalId);

        if (!user || !bid || !proposal || user.uid !== bid.vendorId) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Invalid operation.' });
            throw new Error('Permission Denied');
        }
        
        // Update bid
        setBids(prevBids => prevBids.map(b => b.id === bidId ? { ...b, status: 'closed', acceptedProposalId: proposalId } : b));

        // Update proposals
        setProposals(prevProposals => prevProposals.map(p => {
            if (p.bidId === bidId) {
                return { ...p, status: p.id === proposalId ? 'accepted' : 'rejected' };
            }
            return p;
        }));

        const ordersCollection = collection(db, 'orders');
        const newOrder: Omit<Order, 'id'> = {
            vendorId: bid.vendorId,
            supplierId: proposal.supplierId,
            supplierName: proposal.supplierName,
            items: [{ name: bid.item, quantity: bid.quantity, price: proposal.price }],
            status: 'Order Placed',
            orderDate: Timestamp.now(),
            deliveryTimestamp: null,
        };
        
        try {
            await addDoc(ordersCollection, newOrder);
            toast({title: "Order Created", description: "A new order has been created from the accepted proposal."});
        } catch(e) {
            console.error("Failed to create order", e);
            toast({variant: 'destructive', title: 'Order Creation Failed', description: (e as Error).message});
        }
        
    }, [user, bids, proposals, toast]);

    const getProposalsForBid = useCallback((bidId: string) => {
        return proposals.filter(p => p.bidId === bidId).sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    }, [proposals]);

    const value = {
        bids,
        proposals,
        loading,
        error,
        addBid,
        deleteBid,
        addProposal,
        acceptProposal,
        getProposalsForBid,
    };

    return <BiddingContext.Provider value={value}>{children}</BiddingContext.Provider>;
};

export const useBidding = () => {
    const context = useContext(BiddingContext);
    if (context === undefined) {
        throw new Error('useBidding must be used within a BiddingProvider');
    }
    return context;
};
