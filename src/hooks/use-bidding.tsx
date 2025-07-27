
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
import { Timestamp } from 'firebase/firestore';

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
            // Convert date strings back to Timestamp-like objects for consistency
            const parsedBids = storedBids.map(b => ({ ...b, createdAt: new Timestamp(new Date(b.createdAt as any).getTime() / 1000, 0) }));
            const parsedProposals = storedProposals.map(p => ({ ...p, createdAt: new Timestamp(new Date(p.createdAt as any).getTime() / 1000, 0) }));
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
            createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0),
        };
        setBids(prev => [...prev, newBid]);

    }, [user, toast]);
    
    const deleteBid = useCallback(async (bidId: string) => {
       setBids(prev => prev.filter(b => b.id !== bidId));
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
            createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0),
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

        // Here you would typically create an order, but for localStorage, this is sufficient.
        
    }, [user, bids, proposals, toast]);

    const getProposalsForBid = useCallback((bidId: string) => {
        return proposals.filter(p => p.bidId === bidId);
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
