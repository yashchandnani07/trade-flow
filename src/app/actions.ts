
'use server';

import { aiEnhancedAlert, type AiEnhancedAlertInput, type AiEnhancedAlertOutput } from "@/ai/flows/ai-enhanced-alerts";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mockSuppliers, mockReviews } from "@/lib/data";

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

    // Seed suppliers
    const suppliersCollection = collection(db, "suppliers");
    const suppliersSnapshot = await getDocs(suppliersCollection);
    if (suppliersSnapshot.empty) {
        mockSuppliers.forEach(supplier => {
            const docRef = doc(suppliersCollection, supplier.id);
            batch.set(docRef, supplier);
        });
        console.log('Seeding suppliers...');
    } else {
        console.log('Suppliers collection already exists, skipping seeding.');
    }

    // Seed reviews
    const reviewsCollection = collection(db, "reviews");
    const reviewsSnapshot = await getDocs(reviewsCollection);
    if (reviewsSnapshot.empty) {
        mockReviews.forEach(review => {
            const docRef = doc(reviewsCollection, review.id); 
            batch.set(docRef, review);
        });
        console.log('Seeding reviews...');
    } else {
        console.log('Reviews collection already exists, skipping seeding.');
    }

    await batch.commit();

    return { success: true, message: "Database seeded successfully (if collections were empty)." };
  } catch (error) {
    console.error("Error seeding database: ", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error seeding database: ${errorMessage}` };
  }
}
