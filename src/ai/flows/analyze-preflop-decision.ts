'use server';
/**
 * @fileOverview Analyzes preflop poker decisions using GTO principles and provides feedback.
 *
 * - analyzePreflopDecision - Analyzes the decision and provides feedback.
 * - AnalyzePreflopDecisionInput - The input type for analyzePreflopDecision.
 * - AnalyzePreflopDecisionOutput - The output type for analyzePreflopDecision.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePreflopDecisionInputSchema = z.object({
  position: z
    .string()
    .describe("The player's position at the table (e.g., 'SB', 'BB', 'UTG')."),
  stackSize: z.number().describe('The player stack size in big blinds.'),
  tableType: z.enum(['cash', 'tournament']).describe('The type of table.'),
  hand: z.string().describe('The player hand (e.g., AsKd, 7c7d).'),
  action: z.enum(['fold', 'call', 'raise']).describe('The player action.'),
  betSize: z.number().optional().describe('The bet size if the action is raise.'),
});
export type AnalyzePreflopDecisionInput = z.infer<
  typeof AnalyzePreflopDecisionInputSchema
>;

const AnalyzePreflopDecisionOutputSchema = z.object({
  isOptimal: z
    .boolean()
    .describe('Whether the decision was optimal according to GTO.'),
  feedback: z.string().describe('Detailed feedback on the decision.'),
  evExplanation: z
    .string()
    .describe('Explanation of the expected value of the play.'),
});
export type AnalyzePreflopDecisionOutput = z.infer<
  typeof AnalyzePreflopDecisionOutputSchema
>;

export async function analyzePreflopDecision(
  input: AnalyzePreflopDecisionInput
): Promise<AnalyzePreflopDecisionOutput> {
  return analyzePreflopDecisionFlow(input);
}

const analyzePreflopDecisionPrompt = ai.definePrompt({
  name: 'analyzePreflopDecisionPrompt',
  input: {schema: AnalyzePreflopDecisionInputSchema},
  output: {schema: AnalyzePreflopDecisionOutputSchema},
  prompt: `You are an expert poker coach, specializing in preflop play.

You are given the following information about a poker hand:

*   Position: {{{position}}}
*   Stack Size: {{{stackSize}}} BB
*   Table Type: {{{tableType}}}
*   Hand: {{{hand}}}
*   Action: {{{action}}}
*   Bet Size (if applicable): {{#if betSize}}{{{betSize}}} BB{{else}}N/A{{/if}}

Analyze the player's decision based on GTO principles and provide detailed feedback.
Explain whether the decision was optimal, and why or why not. Include an explanation of the expected value (EV) of the play.

Ensure your output matches the following schema: {{outputSchema}}`,
});

const analyzePreflopDecisionFlow = ai.defineFlow(
  {
    name: 'analyzePreflopDecisionFlow',
    inputSchema: AnalyzePreflopDecisionInputSchema,
    outputSchema: AnalyzePreflopDecisionOutputSchema,
  },
  async input => {
    const {output} = await analyzePreflopDecisionPrompt(input);
    return output!;
  }
);
