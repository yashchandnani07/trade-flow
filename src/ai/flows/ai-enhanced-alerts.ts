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
  eventType: z.string().describe('The type of event that triggered the alert (e.g., order confirmation, shipping update).'),
  eventDetails: z.string().describe('Detailed information about the event.'),
  userBehaviorData: z.string().describe('Data about the user behavior like past interactions, preferences, etc.'),
  urgency: z.enum(['high', 'medium', 'low']).describe('The urgency level of the event.'),
});
export type AiEnhancedAlertInput = z.infer<typeof AiEnhancedAlertInputSchema>;

const AiEnhancedAlertOutputSchema = z.object({
  alertTitle: z.string().describe('The title of the alert.'),
  alertMessage: z.string().describe('The formatted alert message tailored to the user.'),
  priority: z.enum(['high', 'medium', 'low']).describe('The priority of the alert.'),
});
export type AiEnhancedAlertOutput = z.infer<typeof AiEnhancedAlertOutputSchema>;

export async function aiEnhancedAlert(input: AiEnhancedAlertInput): Promise<AiEnhancedAlertOutput> {
  return aiEnhancedAlertFlow(input);
}

const aiEnhancedAlertPrompt = ai.definePrompt({
  name: 'aiEnhancedAlertPrompt',
  input: {schema: AiEnhancedAlertInputSchema},
  output: {schema: AiEnhancedAlertOutputSchema},
  prompt: `You are an AI assistant designed to generate and format user alerts based on event type, details, user behavior, and urgency.

  Based on the following information, create a concise and informative alert.  Consider the user's past behavior and the urgency of the event to tailor the message and set the appropriate priority.

  Event Type: {{{eventType}}}
  Event Details: {{{eventDetails}}}
  User Behavior Data: {{{userBehaviorData}}}
  Urgency: {{{urgency}}}

  Format the alert to be easily understood and actionable.  The alertTitle should be short and descriptive. The alertMessage should provide all necessary information. Set the priority based on the urgency and user behavior data.
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
