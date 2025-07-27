
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
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { Timestamp, collection, addDoc, query, where, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { FirebaseError } from 'firebase/app';
import type { MarketplaceItem, Bid } from '@/lib/types';


interface BiddingContextType {
    marketplaceItems: MarketplaceItem[];
    myBids: Bid[];
    loading: boolean;
    error: FirebaseError | undefined;
    isPlacingBid: boolean;
    placeBid: (item: MarketplaceItem, amount: number) => Promise<void>;
}

const BiddingContext = createContext<BiddingContextType | undefined>(undefined);


export const BiddingProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPlacingBid, setIsPlacingBid] = useState(false);

    // Fetch all marketplace items
    const itemsCollection = useMemo(() => collection(db, 'marketplaceItems'), []);
    const itemsQuery = useMemo(() => orderBy('name'), []);
    const [marketplaceItems, loadingItems, errorItems] = useCollectionData(query(itemsCollection, itemsQuery), { idField: 'id' });

    // Fetch bids placed by the current supplier
    const bidsCollection = useMemo(() => collection(db, 'bids'), []);
    const bidsQuery = useMemo(() => {
        if (user?.role !== 'supplier') return null;
        return query(bidsCollection, where('supplierId', '==', user.uid), orderBy('timestamp', 'desc'));
    }, [bidsCollection, user]);
    
    const [myBids, loadingBids, errorBids] = useCollectionData(bidsQuery, { idField: 'id' });
    
    const placeBid = async (item: MarketplaceItem, amount: number) => {
        if (!user || user.role !== 'supplier') {
            toast({ variant: 'destructive', title: 'Action not allowed', description: 'Only suppliers can place bids.' });
            return;
        }

        setIsPlacingBid(true);
        try {
            await addDoc(bidsCollection, {
                itemId: item.id,
                itemName: item.name,
                supplierId: user.uid,
                supplierName: user.businessName,
                amount: amount,
                timestamp: serverTimestamp(),
                status: 'active',
            });
        } catch (error) {
             console.error('Error placing bid:', error);
             toast({ variant: 'destructive', title: 'Bidding Failed', description: 'Could not place your bid. Please try again.' });
             throw error;
        } finally {
            setIsPlacingBid(false);
        }
    };


    const value: BiddingContextType = {
        marketplaceItems: (marketplaceItems as MarketplaceItem[]) || [],
        myBids: (myBids as Bid[]) || [],
        loading: loadingItems || loadingBids,
        error: errorItems || errorBids,
        isPlacingBid,
        placeBid
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
