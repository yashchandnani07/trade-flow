
'use server';

import { aiEnhancedAlert, type AiEnhancedAlertInput, type AiEnhancedAlertOutput } from "@/ai/flows/ai-enhanced-alerts";
import { collection, getDocs, writeBatch, doc, query, where, limit, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { StockItem } from "@/lib/types";
import { differenceInDays, format, startOfDay } from "date-fns";

async function getExpiringStockAlerts(userId: string): Promise<AiEnhancedAlertOutput[]> {
    if (!userId) return [];

    const today = startOfDay(new Date()); // Normalize to the beginning of the day
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(today.getDate() + 5);

    const stockCollection = collection(db, 'stockItems');
    // This query now correctly checks for items expiring from the start of today
    // up to the end of the 5th day.
    const q = query(
        stockCollection,
        where("ownerId", "==", userId),
        where("expiryDate", ">=", Timestamp.fromDate(today)),
        where("expiryDate", "<=", Timestamp.fromDate(fiveDaysFromNow))
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return [];
    }

    const expiringItems = querySnapshot.docs.map(doc => doc.data() as Omit<StockItem, 'id'>);

    // Generate an AI-enhanced alert for each expiring item.
    const alertPromises = expiringItems.map(item => {
        const daysLeft = differenceInDays(item.expiryDate.toDate(), today);
        const dayString = daysLeft <= 1 ? "day" : "days";

        const input: AiEnhancedAlertInput = {
            eventType: 'Urgent Stock Expiry',
            eventDetails: `Your stock of ${item.name} (${item.quantity} units) is expiring in ${daysLeft} ${dayString} on ${format(item.expiryDate.toDate(), 'PPP')}.`,
            userBehaviorData: 'User actively manages stock.',
            urgency: 'high',
        };
        
        return aiEnhancedAlert(input).catch(error => {
            console.error("AI Alert Generation Error:", error);
            // Fallback to a simple message if AI fails for a real alert
            return {
              alertTitle: "Urgent Stock Alert",
              alertMessage: input.eventDetails,
              priority: 'high' as const,
            };
        });
    });

    return Promise.all(alertPromises);
}


export async function generateAlerts(userId: string): Promise<AiEnhancedAlertOutput[]> {
  // Check for real, urgent alerts about expiring stock for the specific user.
  const expiringStockAlerts = await getExpiringStockAlerts(userId);
  return expiringStockAlerts;
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
    seeded = await seedCollection("suppliers", []) || seeded;
    seeded = await seedCollection("reviews", []) || seeded;
    seeded = await seedCollection("orders", []) || seeded;

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

