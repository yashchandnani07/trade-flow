
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import type { Bid, Proposal } from '@/lib/types';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';


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

const BIDS_STORAGE_KEY = 'tradeflow_bids';
const PROPOSALS_STORAGE_KEY = 'tradeflow_proposals';


export const BiddingProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [bids, setBids] = useState<Bid[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();
    
    // Load from localStorage on initial mount
    useEffect(() => {
        try {
            const storedBids = window.localStorage.getItem(BIDS_STORAGE_KEY);
            if (storedBids) {
                setBids(JSON.parse(storedBids));
            }
            const storedProposals = window.localStorage.getItem(PROPOSALS_STORAGE_KEY);
            if(storedProposals) {
                setProposals(JSON.parse(storedProposals));
            }
        } catch (err) {
            console.error("Failed to load from localStorage", err);
            setError(err instanceof Error ? err : new Error("Failed to load data"));
        } finally {
            setLoading(false);
        }
    }, []);

    // Save to localStorage whenever bids or proposals change
    useEffect(() => {
        try {
            window.localStorage.setItem(BIDS_STORAGE_KEY, JSON.stringify(bids));
        } catch (err) {
            console.error("Failed to save bids to localStorage", err);
        }
    }, [bids]);
    
    useEffect(() => {
        try {
            window.localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals));
        } catch (err) {
            console.error("Failed to save proposals to localStorage", err);
        }
    }, [proposals]);


    const addBid = useCallback(async (newBidData: Omit<Bid, 'id' | 'status' | 'createdAt' | 'vendorId' | 'vendorName' | 'acceptedProposalId'>) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Permission Denied' });
            return;
        }

        const newBid: Bid = {
            id: `bid_${Date.now()}_${Math.random()}`,
            ...newBidData,
            vendorId: user.uid,
            vendorName: user.businessName || 'Anonymous Vendor',
            status: 'open',
            createdAt: new Date().toISOString(),
        };
        
        setBids(prev => [newBid, ...prev]);

    }, [user, toast]);
    
    const deleteBid = useCallback(async (bidId: string) => {
       setBids(prev => prev.filter(b => b.id !== bidId));
    }, []);

    const addProposal = useCallback(async (bidId: string, newProposalData: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'bidId' | 'supplierId' | 'supplierName'>) => {
        if (!user || user.role !== 'supplier') {
            toast({ variant: 'destructive', title: 'Permission Denied' });
            return;
        }
        
        const newProposal: Proposal = {
            id: `prop_${Date.now()}_${Math.random()}`,
            bidId: bidId,
            supplierId: user.uid,
            supplierName: user.businessName || 'Anonymous Supplier',
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...newProposalData,
        };

        setProposals(prev => [...prev, newProposal]);

    }, [user, toast]);

    const acceptProposal = useCallback(async (bidId: string, proposalId: string) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Permission Denied' });
            return;
        }

        // Close bid in local state
        setBids(prev => prev.map(b => 
            b.id === bidId ? { ...b, status: 'closed', acceptedProposalId: proposalId } : b
        ));

        // Update local proposal state
        setProposals(prev => prev.map(p => {
            if (p.bidId === bidId) {
                return { ...p, status: p.id === proposalId ? 'accepted' : 'rejected' };
            }
            return p;
        }));
    }, [user, toast]);

    const getProposalsForBid = useCallback((bidId: string) => {
        return proposals.filter(p => p.bidId === bidId);
    }, [proposals]);

    const value = {
        bids: bids,
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
