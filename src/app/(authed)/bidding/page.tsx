
'use client';
import { useAuth } from "@/hooks/use-auth";
import { MarketplaceBidsList } from "@/components/bids/marketplace-bids-list";
import { MyRequirementsList } from "@/components/bids/my-requirements-list";
import { MyBidsList } from "@/components/bids/my-bids-list";

export default function BiddingPage() {
    const { user } = useAuth();

    if (user?.role === 'vendor') {
        return (
            <div className="space-y-8">
                <MyRequirementsList />
                <MarketplaceBidsList />
                 <MyBidsList />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <MarketplaceBidsList />
            <MyBidsList />
        </div>
    );
}
