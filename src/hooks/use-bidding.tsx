
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
    writeBatch,
    where,
    collectionGroup,
} from 'firebase/firestore';
import { useCollectionData, useCollection } from 'react-firebase-hooks/firestore';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';


interface BiddingContextType {
  bids: Bid[];
  proposals: Proposal[];
  loading: boolean;
  error?: Error;
  addBid: (newBidData: Omit<Bid, 'id' | 'status' | 'createdAt' | 'vendorId' | 'vendorName'>) => Promise<void>;
  deleteBid: (bidId: string) => Promise<void>;
  addProposal: (bidId: string, newProposalData: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'bidId' | 'supplierId' | 'supplierName'>) => Promise<void>;
  acceptProposal: (bidId: string, proposalId: string) => Promise<void>;
  getProposalsForBid: (bidId: string) => Proposal[];
}

const BiddingContext = createContext<BiddingContextType | undefined>(undefined);

export const BiddingProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch all bids
    const bidsQuery = useMemo(() => query(collection(db, 'bids'), orderBy('createdAt', 'desc')), []);
    const [bidsSnapshot, bidsLoading, bidsError] = useCollection(bidsQuery);
    const bids = useMemo(() => (bidsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || []) as Bid[], [bidsSnapshot]);

    // Fetch all proposals using a collection group query
    const proposalsQuery = useMemo(() => query(collectionGroup(db, 'proposals')), []);
    const [proposalsSnapshot, proposalsLoading, proposalsError] = useCollection(proposalsQuery);
    const proposals = useMemo(() => (proposalsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || []) as Proposal[], [proposalsSnapshot]);

    const loading = bidsLoading || proposalsLoading;
    const error = bidsError || proposalsError;

    const addBid = useCallback(async (newBidData: Omit<Bid, 'id' | 'status' | 'createdAt' | 'vendorId' | 'vendorName'>) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only vendors can post new requirements.' });
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
        const bidDocRef = doc(db, 'bids', bidId);
        await deleteDoc(bidDocRef);
        // Note: Deleting subcollections (proposals) needs a Cloud Function for production.
        // For this app, we assume they become orphaned but won't be displayed.
    }, []);

    const addProposal = useCallback(async (bidId: string, newProposalData: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'bidId' | 'supplierId' | 'supplierName'>) => {
        if (!user || user.role !== 'supplier') {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only suppliers can submit proposals.' });
            return;
        }
        const proposalsCollection = collection(db, 'bids', bidId, 'proposals');
        await addDoc(proposalsCollection, {
            ...newProposalData,
            bidId: bidId,
            supplierId: user.uid,
            supplierName: user.businessName || 'Anonymous Supplier',
            status: 'pending',
            createdAt: serverTimestamp(),
        });
    }, [user, toast]);

    const acceptProposal = useCallback(async (bidId: string, proposalId: string) => {
         if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only the vendor can accept proposals.' });
            return;
        }

        const bidDocRef = doc(db, 'bids', bidId);
        const proposalDocRef = doc(db, 'bids', bidId, 'proposals', proposalId);

        const batch = writeBatch(db);
        batch.update(bidDocRef, { status: 'closed', acceptedProposalId: proposalId });
        batch.update(proposalDocRef, { status: 'accepted' });

        await batch.commit();

    }, [user, toast]);

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
