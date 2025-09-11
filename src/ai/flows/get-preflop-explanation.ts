
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
  feedback: z.string().describe('Análisis conciso y directo sobre la decisión.'),
  evExplanation: z
    .string()
    .describe('Breve explicación del valor esperado (EV) de la jugada.'),
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
  prompt: `Eres un entrenador de poker experto que se comunica en español. Tu feedback debe ser conciso.

Analiza la siguiente mano de poker preflop y proporciona una explicación concisa y directa.

*   Posición: {{{position}}}
*   Stack: {{{stackSize}}} BB
*   Mesa: {{{tableType}}}
*   Mano: {{{hand}}}
*   Acción del jugador: {{{action}}}
*   Tamaño de la Apuesta: {{#if betSize}}{{{betSize}}} BB{{else}}N/A{{/if}}
*   La decisión fue: {{#if isOptimal}}Correcta{{else}}Incorrecta{{/if}}

**Instrucciones:**
1.  **Idioma:** Responde **completamente en español**.
2.  **Claridad:** Sé directo y fácil de entender.
3.  **Terminología:** **NO traduzcas** términos comunes de poker como 'equity', 'range', 'fold', 'call', 'raise', 'GTO', 'EV', 'pot odds', 'nuts', 'bluff', 'semi-bluff', 'implied odds'.
4.  **Contenido:**
    *   **Feedback:** Explica por qué la jugada fue correcta o incorrecta basándote en principios GTO. Sé breve.
    *   **EV Explanation:** Proporciona una explicación muy breve sobre el valor esperado (EV) de la acción realizada.

Asegúrate de que tu respuesta coincida con el esquema JSON de salida.`,
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
