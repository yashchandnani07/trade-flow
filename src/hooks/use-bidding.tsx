
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

// In-memory data store for the prototype
const initialBids: Bid[] = [
    {
        id: 'bid-1',
        vendorId: 'vendor-user-id',
        vendorName: 'Speedy Snacks',
        item: 'High-Quality Potatoes',
        quantity: 200,
        targetPrice: 1.5,
        status: 'open',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'bid-2',
        vendorId: 'vendor-user-id-2',
        vendorName: 'Tasty Treats',
        item: 'Organic Onions',
        quantity: 150,
        targetPrice: 2.1,
        status: 'open',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    }
];

const initialProposals: Proposal[] = [];


interface BiddingContextType {
  bids: Bid[];
  proposals: Proposal[];
  loading: boolean;
  addBid: (newBidData: Omit<Bid, 'id' | 'status' | 'createdAt'>) => void;
  deleteBid: (bidId: string) => void;
  addProposal: (bidId: string, newProposalData: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'bidId'>) => void;
  acceptProposal: (bidId: string, proposalId: string) => void;
  getProposalsForBid: (bidId: string) => Proposal[];
  getMyProposals: (supplierId: string) => Proposal[];
}

const BiddingContext = createContext<BiddingContextType | undefined>(undefined);

export const BiddingProvider = ({ children }: { children: ReactNode }) => {
  const [bids, setBids] = useState<Bid[]>(initialBids);
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
        setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addBid = useCallback((newBidData: Omit<Bid, 'id' | 'status' | 'createdAt'>) => {
    const newBid: Bid = {
      ...newBidData,
      id: `bid-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setBids(prevBids => [newBid, ...prevBids]);
  }, []);

  const deleteBid = useCallback((bidId: string) => {
    setBids(prevBids => prevBids.filter(bid => bid.id !== bidId));
    // Also remove associated proposals
    setProposals(prevProposals => prevProposals.filter(p => p.bidId !== bidId));
  }, []);

  const addProposal = useCallback((bidId: string, newProposalData: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'bidId'>) => {
    const newProposal: Proposal = {
      ...newProposalData,
      id: `prop-${Date.now()}`,
      bidId: bidId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setProposals(prevProposals => [...prevProposals, newProposal]);
  }, []);

  const acceptProposal = useCallback((bidId: string, proposalId: string) => {
    setBids(prevBids => 
        prevBids.map(bid => 
            bid.id === bidId ? { ...bid, status: 'closed', acceptedProposalId: proposalId } : bid
        )
    );
    setProposals(prevProposals =>
        prevProposals.map(proposal =>
            proposal.id === proposalId ? { ...proposal, status: 'accepted' } : proposal
        )
    );
  }, []);

  const getProposalsForBid = useCallback((bidId: string) => {
    return proposals.filter(p => p.bidId === bidId);
  }, [proposals]);

  const getMyProposals = useCallback((supplierId: string) => {
    return proposals.filter(p => p.supplierId === supplierId);
  }, [proposals]);


  const value = {
    bids,
    proposals,
    loading,
    addBid,
    deleteBid,
    addProposal,
    acceptProposal,
    getProposalsForBid,
    getMyProposals,
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
