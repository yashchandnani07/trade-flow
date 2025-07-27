
'use client';
import { useAuth } from "@/hooks/use-auth";
import { MarketplaceItemsList } from "@/components/bids/marketplace-items-list";
import { MyBidsList } from "@/components/bids/my-bids-list";

export default function BiddingPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <MarketplaceItemsList />
            {user?.role === 'supplier' && (
                <section id="my-bids">
                    <MyBidsList />
                </section>
            )}
        </div>
    );
}
