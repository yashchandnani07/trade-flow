
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
import { Timestamp, collection, addDoc, getDocs, query, where, writeBatch, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { FirebaseError } from 'firebase/app';


interface BiddingContextType {
  bids: Bid[];
  proposals: Proposal[];
  loading: boolean;
  error?: FirebaseError;
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

    const bidsRef = useMemo(() => collection(db, 'bids'), []);
    const proposalsRef = useMemo(() => collection(db, 'proposals'), []);
    
    const bidsQuery = useMemo(() => query(bidsRef, orderBy('createdAt', 'desc')), [bidsRef]);
    const proposalsQuery = useMemo(() => query(proposalsRef, orderBy('createdAt', 'desc')), [proposalsRef]);

    const [bids, bidsLoading, bidsError] = useCollectionData(bidsQuery, { idField: 'id' });
    const [proposals, proposalsLoading, proposalsError] = useCollectionData(proposalsQuery, { idField: 'id' });

    const loading = bidsLoading || proposalsLoading;
    const error = bidsError || proposalsError;


    const addBid = useCallback(async (newBidData: Omit<Bid, 'id' | 'status' | 'createdAt' | 'vendorId' | 'vendorName' | 'acceptedProposalId'>) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only vendors can post requirements.' });
            throw new Error('Permission Denied');
        }
        
        try {
            await addDoc(bidsRef, {
                ...newBidData,
                vendorId: user.uid,
                vendorName: user.businessName || 'Anonymous Vendor',
                status: 'open',
                createdAt: serverTimestamp(),
            });
        } catch(e) {
            console.error("Failed to add bid:", e);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not post requirement.'});
            throw e;
        }

    }, [user, toast, bidsRef]);
    
    const deleteBid = useCallback(async (bidId: string) => {
       try {
        await deleteDoc(doc(db, 'bids', bidId));
       } catch (e) {
        console.error("Failed to delete bid:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete requirement.'});
        throw e;
       }
    }, [toast]);

    const addProposal = useCallback(async (bidId: string, newProposalData: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'bidId' | 'supplierId' | 'supplierName'>) => {
        if (!user || user.role !== 'supplier') {
             toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only suppliers can submit proposals.' });
            throw new Error('Permission Denied');
        }
        
        try {
            await addDoc(proposalsRef, {
                ...newProposalData,
                bidId,
                supplierId: user.uid,
                supplierName: user.businessName || 'Anonymous Supplier',
                status: 'pending',
                createdAt: serverTimestamp(),
            });
        } catch(e) {
            console.error("Failed to add proposal:", e);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit proposal.'});
            throw e;
        }
    }, [user, toast, proposalsRef]);

    const acceptProposal = useCallback(async (bidId: string, proposalId: string) => {
        const bid = bids?.find(b => b.id === bidId);
        const allProposals = proposals || [];
        const proposalToAccept = allProposals.find(p => p.id === proposalId);

        if (!user || !bid || !proposalToAccept || user.uid !== bid.vendorId) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Invalid operation.' });
            throw new Error('Permission Denied');
        }
        
        try {
            const batch = writeBatch(db);
            
            // Update bid status
            const bidRef = doc(db, 'bids', bidId);
            batch.update(bidRef, { status: 'closed', acceptedProposalId: proposalId });

            // Update all proposals for this bid
            const bidProposals = allProposals.filter(p => p.bidId === bidId);
            bidProposals.forEach(p => {
                const proposalRef = doc(db, 'proposals', p.id);
                batch.update(proposalRef, { status: p.id === proposalId ? 'accepted' : 'rejected' });
            });
            
            // Create a new order
            const orderRef = doc(collection(db, 'orders'));
            const newOrder: Omit<Order, 'id'> = {
                vendorId: bid.vendorId,
                supplierId: proposalToAccept.supplierId,
                supplierName: proposalToAccept.supplierName,
                items: [{ name: bid.item, quantity: bid.quantity, price: proposalToAccept.price }],
                status: 'Order Placed',
                orderDate: serverTimestamp() as Timestamp,
                deliveryTimestamp: null,
            };
            batch.set(orderRef, newOrder);
            
            await batch.commit();

            toast({title: "Order Created", description: "A new order has been created from the accepted proposal."});
        } catch(e) {
            console.error("Failed to accept proposal and create order:", e);
            toast({variant: 'destructive', title: 'Operation Failed', description: (e as Error).message});
            throw e;
        }
        
    }, [user, bids, proposals, toast]);

    const getProposalsForBid = useCallback((bidId: string) => {
        if (!proposals) return [];
        return proposals.filter(p => p.bidId === bidId).sort((a,b) => {
            const dateA = a.createdAt ? (a.createdAt as Timestamp).toDate() : new Date();
            const dateB = b.createdAt ? (b.createdAt as Timestamp).toDate() : new Date();
            return dateB.getTime() - dateA.getTime();
        });
    }, [proposals]);

    const value = {
        bids: bids || [],
        proposals: proposals || [],
        loading,
        error: error || undefined,
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
