'use server';
/**
 * @fileOverview Provides a detailed explanation for a preflop poker decision.
 *
 * - getPreflopExplanation - Generates the explanation.
 * - GetPreflopExplanationInput - The input type for getPreflopExplanation.
 * - GetPreflopExplanationOutput - The output type for getPreflopExplanation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPreflopExplanationInputSchema = z.object({
  position: z
    .string()
    .describe("The player's position at the table (e.g., 'SB', 'BB', 'UTG')."),
  stackSize: z.number().describe('The player stack size in big blinds.'),
  tableType: z.enum(['cash', 'tournament']).describe('The type of table.'),
  hand: z.string().describe('The player hand (e.g., AsKd, 7c7d).'),
  action: z.enum(['fold', 'call', 'raise']).describe('The player action.'),
  betSize: z.number().optional().describe('The bet size if the action is raise.'),
  isOptimal: z.boolean().describe('Whether the decision was optimal.'),
});
export type GetPreflopExplanationInput = z.infer<
  typeof GetPreflopExplanationInputSchema
>;

const GetPreflopExplanationOutputSchema = z.object({
  feedback: z.string().describe('Detailed feedback on the decision.'),
  evExplanation: z
    .string()
    .describe('Explanation of the expected value of the play.'),
});
export type GetPreflopExplanationOutput = z.infer<
  typeof GetPreflopExplanationOutputSchema
>;

export async function getPreflopExplanation(
  input: GetPreflopExplanationInput
): Promise<GetPreflopExplanationOutput> {
  return getPreflopExplanationFlow(input);
}

const getPreflopExplanationPrompt = ai.definePrompt({
  name: 'getPreflopExplanationPrompt',
  input: {schema: GetPreflopExplanationInputSchema},
  output: {schema: GetPreflopExplanationOutputSchema},
  prompt: `Eres un entrenador de poker experto, especializado en el juego preflop.

Se te proporciona la siguiente información sobre una mano de poker:

*   Posición: {{{position}}}
*   Stack Size: {{{stackSize}}} BB
*   Tipo de Mesa: {{{tableType}}}
*   Mano: {{{hand}}}
*   Acción: {{{action}}}
*   Tamaño de la Apuesta (si aplica): {{#if betSize}}{{{betSize}}} BB{{else}}N/A{{/if}}
*   La decisión fue: {{#if isOptimal}}Óptima{{else}}Subóptima{{/if}}

Proporciona feedback conciso y directo en español. No traduzcas términos de poker como 'equity', 'range', 'fold', 'call', 'raise', 'GTO', 'EV', 'pot odds'.
Explica por qué la decisión fue óptima o no. Incluye una explicación breve del valor esperado (EV) de la jugada.

Asegúrate de que tu respuesta coincida con el siguiente esquema: {{outputSchema}}`,
});

const getPreflopExplanationFlow = ai.defineFlow(
  {
    name: 'getPreflopExplanationFlow',
    inputSchema: GetPreflopExplanationInputSchema,
    outputSchema: GetPreflopExplanationOutputSchema,
  },
  async input => {
    const {output} = await getPreflopExplanationPrompt(input);
    return output!;
  }
);
