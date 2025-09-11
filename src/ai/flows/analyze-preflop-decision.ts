
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
  prompt: `Eres un entrenador de poker experto, especializado en el juego preflop.

Se te proporciona la siguiente información sobre una mano de poker:

*   Posición: {{{position}}}
*   Stack Size: {{{stackSize}}} BB
*   Tipo de Mesa: {{{tableType}}}
*   Mano: {{{hand}}}
*   Acción: {{{action}}}
*   Tamaño de la Apuesta (si aplica): {{#if betSize}}{{{betSize}}} BB{{else}}N/A{{/if}}

Analiza si la decisión del jugador fue óptima basándote en los principios GTO.

Asegúrate de que tu respuesta coincida con el siguiente esquema: {{outputSchema}}`,
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

    