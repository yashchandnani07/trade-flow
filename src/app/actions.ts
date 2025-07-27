
'use server';

import { aiEnhancedAlert, type AiEnhancedAlertInput, type AiEnhancedAlertOutput } from "@/ai/flows/ai-enhanced-alerts";
import { collection, getDocs, writeBatch, doc, query, where, limit, orderBy, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { mockSuppliers, mockReviews, mockOrders } from "@/lib/data";
import type { StockItem } from "@/lib/types";
import { differenceInDays, format } from "date-fns";

async function getExpiringStockAlert(): Promise<AiEnhancedAlertInput | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const stockCollection = collection(db, 'stockItems');
    const q = query(
        stockCollection,
        where("ownerId", "==", user.uid),
        where("expiryDate", ">=", Timestamp.fromDate(today)),
        where("expiryDate", "<=", Timestamp.fromDate(threeDaysFromNow)),
        orderBy("expiryDate", "asc"),
        limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }

    const expiringItem = querySnapshot.docs[0].data() as StockItem;
    const daysLeft = differenceInDays(expiringItem.expiryDate.toDate(), today);
    const dayString = daysLeft <= 1 ? "day" : "days";

    return {
        eventType: 'Low Stock Warning',
        eventDetails: `Your stock of ${expiringItem.name} (${expiringItem.quantity} units) is expiring in ${daysLeft} ${dayString} on ${format(expiringItem.expiryDate.toDate(), 'PPP')}.`,
        userBehaviorData: 'User actively manages stock.',
        urgency: 'high',
    };
}


export async function generateAlert(): Promise<AiEnhancedAlertOutput> {
  // First, check for a real, urgent alert about expiring stock.
  const expiringStockAlert = await getExpiringStockAlert();
  if (expiringStockAlert) {
      try {
          const result = await aiEnhancedAlert(expiringStockAlert);
          return result;
      } catch (error) {
          console.error("AI Alert Generation Error (for stock):", error);
          // Fallback to a simple message if AI fails for the real alert
          return {
              alertTitle: "Urgent Stock Alert",
              alertMessage: expiringStockAlert.eventDetails,
              priority: 'high',
          };
      }
  }

  // If no real alerts, generate a random mock alert.
  const eventTypes = ['Order Shipped', 'New Bid Received', 'Payment Processed', 'Contract expiring soon'];
  const userBehaviors = ['Frequently checks tracking page', 'Prefers email notifications', 'Has not logged in for a week', 'High-value customer'];
  const urgencies: Array<"low" | "medium" | "high"> = ['low', 'medium', 'high'];

  const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const mockInput: AiEnhancedAlertInput = {
    eventType: randomElement(eventTypes),
    eventDetails: `Order #${Math.floor(Math.random() * 9000) + 1000} for 500 units of widgets.`,
    userBehaviorData: randomElement(userBehaviors),
    urgency: randomElement(urgencies),
  };

  try {
    const result = await aiEnhancedAlert(mockInput);
    return result;
  } catch (error) {
    console.error("AI Alert Generation Error (for mock):", error);
    return {
      alertTitle: "Error: Could Not Generate Alert",
      alertMessage: "The AI service is currently unavailable. Please try again later.",
      priority: 'high',
    };
  }
}

export async function seedDatabase() {
  try {
    const batch = writeBatch(db);

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

    let seeded = false;
    seeded = await seedCollection("suppliers", mockSuppliers) || seeded;
    seeded = await seedCollection("reviews", mockReviews) || seeded;
    seeded = await seedCollection("orders", mockOrders) || seeded;

    if (seeded) {
        await batch.commit();
        return { success: true, message: "Database seeded successfully." };
    } else {
        return { success: true, message: "Database already contains data. No new data was added." };
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
