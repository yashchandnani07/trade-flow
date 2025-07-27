
'use client';
import { MarketplaceBidsList } from "@/components/bids/marketplace-bids-list";
import { MyBidsList } from "@/components/bids/my-bids-list";
import { useAuth } from "@/hooks/use-auth";

export default function BiddingPage() {
    const { user } = useAuth();
    return (
        <div className="space-y-6">
            {user?.role === 'supplier' && <MyBidsList />}
            <MarketplaceBidsList />
        </div>
    );
}
