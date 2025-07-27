
'use client';
import { useAuth } from "@/hooks/use-auth";
import { MarketplaceBidsList } from "@/components/bids/marketplace-bids-list";
import { MyRequirementsList } from "@/components/bids/my-requirements-list";
import { MyBidsList } from "@/components/bids/my-bids-list";

export default function BiddingPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            {user?.role === 'vendor' && (
                <section id="my-requirements">
                    <MyRequirementsList />
                </section>
            )}

            <section id="marketplace">
                 <MarketplaceBidsList />
            </section>
           
            {user?.role === 'supplier' && (
                <section id="my-bids">
                    <MyBidsList />
                </section>
            )}
        </div>
    );
}
