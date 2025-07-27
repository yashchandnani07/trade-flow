
'use client';
import {
  createContext,
  useContext,
  ReactNode,
} from 'react';

// A simple context provider without complex logic
const BiddingContext = createContext<{} | undefined>(undefined);

export const BiddingProvider = ({ children }: { children: ReactNode }) => {
    const value = {}; // No shared state needed anymore
    return <BiddingContext.Provider value={value}>{children}</BiddingContext.Provider>;
};

export const useBidding = () => {
    const context = useContext(BiddingContext);
    if (context === undefined) {
        throw new Error('useBidding must be used within a BiddingProvider');
    }
    return context;
};
