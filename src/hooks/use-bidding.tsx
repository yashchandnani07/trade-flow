
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
import type { Bid, Proposal } from '@/lib/types';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    Timestamp,
} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
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

export const BiddingProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch Bids from Firestore
    const bidsQuery = useMemo(() => query(collection(db, 'bids'), orderBy('createdAt', 'desc')), []);
    const [bids, loading, error] = useCollectionData(bidsQuery, { idField: 'id' });

    // Manage proposals in-memory
    const [proposals, setProposals] = useState<Proposal[]>([]);

    const addBid = useCallback(async (newBidData: Omit<Bid, 'id' | 'status' | 'createdAt' | 'vendorId' | 'vendorName' | 'acceptedProposalId'>) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Permission Denied' });
            return;
        }
        const bidsCollection = collection(db, 'bids');
        await addDoc(bidsCollection, {
            ...newBidData,
            vendorId: user.uid,
            vendorName: user.businessName || 'Anonymous Vendor',
            status: 'open',
            createdAt: serverTimestamp(),
        });
    }, [user, toast]);
    
    const deleteBid = useCallback(async (bidId: string) => {
        // This will only delete from Firestore.
        // We don't need to manage local state as react-firebase-hooks does it.
        const bidDocRef = doc(db, 'bids', bidId);
        await deleteDoc(bidDocRef);
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
            createdAt: Timestamp.now(), // Use a client-side timestamp for in-memory
            ...newProposalData,
        };

        setProposals(prev => [...prev, newProposal]);

    }, [user, toast]);

    const acceptProposal = useCallback(async (bidId: string, proposalId: string) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Permission Denied' });
            return;
        }

        // Close bid in Firestore
        const bidDocRef = doc(db, 'bids', bidId);
        await updateDoc(bidDocRef, {
            status: 'closed',
            acceptedProposalId: proposalId,
        });

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
        bids: (bids || []) as Bid[],
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
