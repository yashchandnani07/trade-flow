
'use server';

/**
 * @fileOverview An AI-enhanced alert system that prioritizes and tailors alerts based on user behavior and event urgency.
 *
 * - aiEnhancedAlert - A function that generates and formats alerts based on user behavior and event urgency.
 * - AiEnhancedAlertInput - The input type for the aiEnhancedAlert function.
 * - AiEnhancedAlertOutput - The return type for the aiEnhancedAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiEnhancedAlertInputSchema = z.object({
  eventType: z.string().describe('The type of event that triggered the alert (e.g., Stock Expiry Warning, order confirmation, shipping update).'),
  eventDetails: z.string().describe('Detailed information about the event. This is the primary source of information.'),
  userBehaviorData: z.string().describe('Data about the user behavior like past interactions, preferences, etc. This provides context.'),
  urgency: z.enum(['high', 'medium', 'low']).describe('The urgency level of the event.'),
});
export type AiEnhancedAlertInput = z.infer<typeof AiEnhancedAlertInputSchema>;

const AiEnhancedAlertOutputSchema = z.object({
  alertTitle: z.string().describe('A short, clear, and concise title for the alert. Example: "Stock Expiration Warning"'),
  alertMessage: z.string().describe('The formatted alert message. It should be a clear, user-friendly summary of the eventDetails. Example: "Your stock of Apples is nearing its expiration date!"'),
  priority: z.enum(['high', 'medium', 'low']).describe('The priority of the alert, derived from the urgency.'),
});
export type AiEnhancedAlertOutput = z.infer<typeof AiEnhancedAlertOutputSchema>;

export async function aiEnhancedAlert(input: AiEnhancedAlertInput): Promise<AiEnhancedAlertOutput> {
  return aiEnhancedAlertFlow(input);
}

const aiEnhancedAlertPrompt = ai.definePrompt({
  name: 'aiEnhancedAlertPrompt',
  input: {schema: AiEnhancedAlertInputSchema},
  output: {schema: AiEnhancedAlertOutputSchema},
  prompt: `You are an AI assistant for a supply chain management app called TradeFlow. Your task is to create a clear and concise alert for the user based on the provided information.

  **Instructions:**
  1.  **Analyze the Input:** Use the event details as the main source of information.
  2.  **Create a Title:** The \`alertTitle\` should be a short, direct summary of the event type. For a 'Stock Expiry Warning', the title should be exactly that.
  3.  **Create a Message:** The \`alertMessage\` must be a simple, easy-to-read sentence that clearly explains the alert. For an expiring item, it should state that the item is nearing expiration.
  4.  **Set Priority:** The \`priority\` should match the input \`urgency\`.

  **Alert Details:**
  - **Event Type:** {{{eventType}}}
  - **Urgency:** {{{urgency}}}
  - **Event Details:** {{{eventDetails}}}
  - **User Context:** {{{userBehaviorData}}}
  `,
});

const aiEnhancedAlertFlow = ai.defineFlow(
  {
    name: 'aiEnhancedAlertFlow',
    inputSchema: AiEnhancedAlertInputSchema,
    outputSchema: AiEnhancedAlertOutputSchema,
  },
  async input => {
    const {output} = await aiEnhancedAlertPrompt(input);
    return output!;
  }
);
