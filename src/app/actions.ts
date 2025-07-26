
'use server';

import { aiEnhancedAlert, type AiEnhancedAlertInput, type AiEnhancedAlertOutput } from "@/ai/flows/ai-enhanced-alerts";
import { collection, getDocs, writeBatch, doc, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mockSuppliers, mockReviews, mockOrders } from "@/lib/data";

export async function generateAlert(): Promise<AiEnhancedAlertOutput> {
  const eventTypes = ['Order Shipped', 'New Bid Received', 'Payment Processed', 'Low Stock Warning', 'Contract expiring soon'];
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
    console.error("AI Alert Generation Error:", error);
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
