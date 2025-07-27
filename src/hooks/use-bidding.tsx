
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
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, serverTimestamp, doc, updateDoc, writeBatch, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Bid, Proposal, Order } from '@/lib/types';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { FirebaseError } from 'firebase/app';


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

    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const bidsQuery = useMemo(() => query(bidsCollection, orderBy('createdAt', 'desc')), [bidsCollection]);
    const [bidsSnapshot, bidsLoading, bidsError] = useCollection(bidsQuery);
    const bids = useMemo(() => (bidsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || []) as Bid[], [bidsSnapshot]);
    
    const proposalsCollection = useMemo(() => collection(db, 'proposals'), []);
    const proposalsQuery = useMemo(() => query(proposalsCollection, orderBy('createdAt', 'desc')), [proposalsCollection]);
    const [proposalsSnapshot, proposalsLoading, proposalsError] = useCollection(proposalsQuery);
    const proposals = useMemo(() => (proposalsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || []) as Proposal[], [proposalsSnapshot]);

    const loading = bidsLoading || proposalsLoading;
    const error = bidsError || proposalsError;


    const addBid = useCallback(async (newBidData: Omit<Bid, 'id' | 'status' | 'createdAt' | 'vendorId' | 'vendorName' | 'acceptedProposalId'>) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only vendors can post requirements.' });
            throw new Error('Permission Denied');
        }

        try {
            await addDoc(collection(db, 'bids'), {
                ...newBidData,
                vendorId: user.uid,
                vendorName: user.businessName || 'Anonymous Vendor',
                status: 'open',
                createdAt: serverTimestamp(),
            });
        } catch(e) {
            console.error(e);
            if (e instanceof FirebaseError && (e.code === 'permission-denied' || e.code === 'unauthenticated')) {
                 toast({ variant: 'destructive', title: 'Permission Denied', description: 'Please check your Firestore security rules for the "bids" collection.' });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not post your requirement.' });
            }
            throw e;
        }

    }, [user, toast]);
    
    const deleteBid = useCallback(async (bidId: string) => {
       try {
        await deleteDoc(doc(db, 'bids', bidId));
       } catch (e) {
           console.error(e);
           toast({ variant: 'destructive', title: 'Error', description: 'Could not delete bid.' });
           throw e;
       }
    }, [toast]);

    const addProposal = useCallback(async (bidId: string, newProposalData: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'bidId' | 'supplierId' | 'supplierName'>) => {
        if (!user || user.role !== 'supplier') {
             toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only suppliers can submit proposals.' });
            throw new Error('Permission Denied');
        }
        
       try {
            await addDoc(collection(db, 'proposals'), {
                ...newProposalData,
                bidId: bidId,
                supplierId: user.uid,
                supplierName: user.businessName || 'Anonymous Supplier',
                status: 'pending',
                createdAt: serverTimestamp(),
            });
       } catch (e) {
            console.error(e);
            if (e instanceof FirebaseError && (e.code === 'permission-denied' || e.code === 'unauthenticated')) {
                 toast({ variant: 'destructive', title: 'Permission Denied', description: 'Please check your Firestore security rules for the "proposals" collection.' });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not submit your proposal.' });
            }
            throw e;
       }

    }, [user, toast]);

    const acceptProposal = useCallback(async (bidId: string, proposalId: string) => {
        const bid = bids.find(b => b.id === bidId);
        const proposal = proposals.find(p => p.id === proposalId);

        if (!user || !bid || !proposal || user.uid !== bid.vendorId) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Invalid operation.' });
            throw new Error('Permission Denied');
        }

        const batch = writeBatch(db);

        // 1. Update the bid status
        const bidRef = doc(db, 'bids', bidId);
        batch.update(bidRef, { status: 'closed', acceptedProposalId: proposalId });
        
        // 2. Update all proposals for this bid
        const relatedProposals = proposals.filter(p => p.bidId === bidId);
        relatedProposals.forEach(p => {
            const proposalRef = doc(db, 'proposals', p.id);
            batch.update(proposalRef, { status: p.id === proposalId ? 'accepted' : 'rejected' });
        });

        // 3. Create a new order from the accepted proposal
        const orderRef = doc(collection(db, 'orders'));
        const newOrder: Omit<Order, 'id'> = {
            vendorId: bid.vendorId,
            supplierId: proposal.supplierId,
            supplierName: proposal.supplierName,
            items: [{ name: bid.item, quantity: bid.quantity, price: proposal.price }],
            status: 'Order Placed',
            orderDate: serverTimestamp() as any, // Firestore will convert this
            deliveryTimestamp: null,
        };
        batch.set(orderRef, newOrder);

        try {
            await batch.commit();
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not accept the proposal.' });
            throw e;
        }

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
