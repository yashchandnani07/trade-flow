"use server";

import { aiEnhancedAlert, type AiEnhancedAlertInput, type AiEnhancedAlertOutput } from "@/ai/flows/ai-enhanced-alerts";

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
