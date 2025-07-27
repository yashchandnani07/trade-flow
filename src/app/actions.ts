
'use server';

import { collection, getDocs, writeBatch, doc, query, where, limit, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/lib/types";

// Sample data for marketplace items
const marketplaceItems = [
    {
        name: "Organic Tomatoes",
        category: "Produce",
        currentPrice: 2.50,
        sellerId: "MOCK_SELLER_1",
        sellerName: "FarmFresh Organics",
        imageUrl: "https://placehold.co/600x400.png",
        aiHint: "fresh tomatoes",
    },
    {
        name: "Free-Range Chicken Breast",
        category: "Meat",
        currentPrice: 8.00,
        sellerId: "MOCK_SELLER_2",
        sellerName: "Happy Farms Poultry",
        imageUrl: "https://placehold.co/600x400.png",
        aiHint: "chicken breast",
    },
    {
        name: "Sourdough Bread Loaf",
        category: "Bakery",
        currentPrice: 5.00,
        sellerId: "MOCK_SELLER_3",
        sellerName: "Artisan Bakes",
        imageUrl: "https://placehold.co/600x400.png",
        aiHint: "artisan bread",
    }
];


export async function seedDatabase() {
  try {
    const batch = writeBatch(db);
    let operationsPerformed = false;

    // --- Give "Newly Joined" badge to all suppliers ---
    const usersRef = collection(db, "users");
    const suppliersQuery = query(usersRef, where("role", "==", "supplier"));
    const suppliersSnapshot = await getDocs(suppliersQuery);
    
    let updatedSuppliers = 0;

    suppliersSnapshot.forEach(userDoc => {
        const supplier = userDoc.data() as User;
        const hasBadge = supplier.badges?.some(b => b.name === "Newly Joined");

        if (!hasBadge) {
            const newBadge = { name: "Newly Joined", dateAwarded: Timestamp.now() };
            const updatedBadges = [...(supplier.badges || []), newBadge];
            batch.update(userDoc.ref, { badges: updatedBadges });
            operationsPerformed = true;
            updatedSuppliers++;
        }
    });

    if (updatedSuppliers > 0) {
        console.log(`Adding "Newly Joined" badge to ${updatedSuppliers} suppliers.`);
    }

    const seedCollection = async (collectionName: string, data: any[]) => {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(query(collectionRef, limit(1)));
      if (snapshot.empty) {
        data.forEach(item => {
          const docRef = item.id ? doc(collectionRef, item.id) : doc(collectionRef);
          batch.set(docRef, item);
        });
        console.log(`Seeding ${collectionName}...`);
        return true;
      }
      console.log(`${collectionName} collection already contains data, skipping seeding.`);
      return false;
    }

    const collectionsSeeded = await seedCollection("reviews", []) || await seedCollection("orders", []);
    const marketplaceSeeded = await seedCollection("marketplaceItems", marketplaceItems);

    if (collectionsSeeded || marketplaceSeeded) {
        operationsPerformed = true;
    }

    if (operationsPerformed) {
        await batch.commit();
        let message = "Database operations successful.";
        if (updatedSuppliers > 0) {
            message = `Successfully awarded badges to ${updatedSuppliers} suppliers.`;
        }
        if (collectionsSeeded || marketplaceSeeded) {
            message = "Database seeded successfully."
        }
        return { success: true, message };
    } else {
        return { success: true, message: "Database is already up to date. No new data was added." };
    }

  } catch (error) {
    console.error("Error seeding database: ", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error seeding database: ${errorMessage}` };
  }
}


export async function checkOrderHistory(vendorId: string, supplierId: string): Promise<{ hasCompletedOrder: boolean }> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('vendorId', '==', vendorId),
      where('supplierId', '==', supplierId),
      where('status', '==', 'Received'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    return { hasCompletedOrder: !querySnapshot.empty };

  } catch (error) {
    console.error("Error checking order history:", error);
    // In case of error, default to false to be safe.
    return { hasCompletedOrder: false };
  }
}
