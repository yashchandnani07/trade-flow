
'use client';
import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
} from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { 
    Timestamp, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    serverTimestamp, 
    doc,
    writeBatch,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { FirebaseError } from 'firebase/app';
import type { Bid, Proposal, Order } from '@/lib/types';

interface BiddingContextType {
    bids: Bid[];
    proposals: Proposal[];
    myProposals: (Proposal & { bid?: Bid })[];
    loading: boolean;
    error: FirebaseError | undefined;
    isAddingBid: boolean;
    addBid: (bidData: Omit<Bid, 'id' | 'createdAt' | 'vendorId' | 'vendorName' | 'status' | 'proposals'>) => Promise<void>;
    isAddingProposal: boolean;
    addProposal: (bidId: string, proposalData: { price: number }) => Promise<void>;
    isAcceptingProposal: boolean;
    acceptProposal: (bidId: string, proposalId: string) => Promise<void>;
    isDeletingBid: boolean;
    deleteBid: (bidId: string) => Promise<void>;
    getProposalsForBid: (bidId: string) => Proposal[];
}

const BiddingContext = createContext<BiddingContextType | undefined>(undefined);

export const BiddingProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [isAddingBid, setIsAddingBid] = useState(false);
    const [isAddingProposal, setIsAddingProposal] = useState(false);
    const [isAcceptingProposal, setIsAcceptingProposal] = useState(false);
    const [isDeletingBid, setIsDeletingBid] = useState(false);

    // Fetch all bids
    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const bidsQuery = useMemo(() => query(bidsCollection, orderBy('createdAt', 'desc')), [bidsCollection]);
    const [bids, loadingBids, errorBids] = useCollectionData(bidsQuery, { idField: 'id' });

    // Fetch all proposals
    const proposalsCollection = useMemo(() => collection(db, 'proposals'), []);
    const proposalsQuery = useMemo(() => query(proposalsCollection, orderBy('createdAt', 'desc')), [proposalsCollection]);
    const [proposals, loadingProposals, errorProposals] = useCollectionData(proposalsQuery, { idField: 'id' });

    // Filter proposals made by the current user (if supplier)
    const myProposals = useMemo(() => {
        if (!user || user.role !== 'supplier' || !proposals || !bids) return [];
        return (proposals as Proposal[])
            .filter(p => p.supplierId === user.uid)
            .map(p => ({
                ...p,
                bid: (bids as Bid[]).find(b => b.id === p.bidId)
            }));
    }, [proposals, user, bids]);


    const addBid = async (bidData: Omit<Bid, 'id' | 'createdAt' | 'vendorId' | 'vendorName' | 'status' | 'proposals'>) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Action not allowed', description: 'Only vendors can post requirements.' });
            return;
        }

        setIsAddingBid(true);
        try {
            await addDoc(bidsCollection, {
                ...bidData,
                vendorId: user.uid,
                vendorName: user.businessName,
                status: 'open',
                createdAt: serverTimestamp(),
            });
        } catch (error) {
             console.error('Error adding bid:', error);
             toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not post your requirement.' });
             throw error;
        } finally {
            setIsAddingBid(false);
        }
    };

    const addProposal = async (bidId: string, proposalData: { price: number }) => {
         if (!user || user.role !== 'supplier') {
            toast({ variant: 'destructive', title: 'Action not allowed', description: 'Only suppliers can submit proposals.' });
            return;
        }
        setIsAddingProposal(true);
        try {
            await addDoc(collection(db, 'proposals'), {
                bidId,
                supplierId: user.uid,
                supplierName: user.businessName,
                price: proposalData.price,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error adding proposal:', error);
            toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not submit your proposal.' });
            throw error;
        } finally {
            setIsAddingProposal(false);
        }
    };
    
    const acceptProposal = async (bidId: string, proposalId: string) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Action not allowed' });
            return;
        }
        setIsAcceptingProposal(true);
        try {
            const batch = writeBatch(db);

            // 1. Update the bid status to 'closed' and mark accepted proposal
            const bidRef = doc(db, 'bids', bidId);
            const bid = bids?.find(b => b.id === bidId);
            const proposal = proposals?.find(p => p.id === proposalId);

            if (!bid || !proposal) throw new Error("Bid or proposal not found");

            batch.update(bidRef, { status: 'closed', acceptedProposalId: proposalId });
            
            // 2. Create a new order
            const orderRef = doc(collection(db, 'orders'));
            const newOrder: Omit<Order, 'id'> = {
                vendorId: bid.vendorId,
                supplierId: proposal.supplierId,
                supplierName: proposal.supplierName,
                items: [{ name: bid.item, quantity: bid.quantity, price: proposal.price }],
                status: 'Order Placed',
                orderDate: serverTimestamp() as Timestamp,
                deliveryTimestamp: null,
            };
            batch.set(orderRef, newOrder);

            await batch.commit();

        } catch (error) {
            console.error('Error accepting proposal:', error);
            toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not accept the proposal.' });
            throw error;
        } finally {
            setIsAcceptingProposal(false);
        }
    };
    
    const deleteBid = async (bidId: string) => {
        if (!user || user.role !== 'vendor') {
            toast({ variant: 'destructive', title: 'Action not allowed' });
            return;
        }
        setIsDeletingBid(true);
        try {
            // Also delete all proposals associated with this bid
            const proposalsToDeleteQuery = query(proposalsCollection, where('bidId', '==', bidId));
            const proposalsSnapshot = await getDocs(proposalsToDeleteQuery);
            
            const batch = writeBatch(db);
            proposalsSnapshot.forEach(doc => batch.delete(doc.ref));
            batch.delete(doc(db, 'bids', bidId));
            
            await batch.commit();

        } catch (error) {
            console.error('Error deleting bid:', error);
            toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not delete the requirement.' });
            throw error;
        } finally {
            setIsDeletingBid(false);
        }
    };

    const getProposalsForBid = (bidId: string) => {
        if (!proposals) return [];
        return (proposals as Proposal[]).filter(p => p.bidId === bidId);
    };

    const value: BiddingContextType = {
        bids: (bids as Bid[]) || [],
        proposals: (proposals as Proposal[]) || [],
        myProposals: myProposals || [],
        loading: loadingBids || loadingProposals,
        error: errorBids || errorProposals,
        isAddingBid,
        addBid,
        isAddingProposal,
        addProposal,
        isAcceptingProposal,
        acceptProposal,
        isDeletingBid,
        deleteBid,
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
