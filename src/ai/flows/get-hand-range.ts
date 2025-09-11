
'use server';
/**
 * @fileOverview Provides a detailed GTO hand range for a specific preflop scenario.
 *
 * - getHandRange - Generates the hand range.
 * - GetHandRangeInput - The input type for getHandRange.
 * - GetHandRangeOutput - The output type for getHandRange.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetHandRangeInputSchema = z.object({
  position: z
    .string()
    .describe("The player's position at the table (e.g., 'SB', 'BB', 'UTG')."),
  stackSize: z.number().describe('The player stack size in big blinds.'),
  tableType: z.enum(['cash', 'tournament']).describe('The type of table.'),
});
export type GetHandRangeInput = z.infer<typeof GetHandRangeInputSchema>;

const HandActionSchema = z.record(z.enum(['raise', 'call', 'fold']));

const GetHandRangeOutputSchema = z.object({
    range: HandActionSchema.describe('An object where keys are hand notations (e.g., AKs, 77, T9o) and values are the optimal action: "raise", "call", or "fold". Include all 169 possible hand combinations.')
});

export type GetHandRangeOutput = z.infer<typeof GetHandRangeOutputSchema>;

export async function getHandRange(
  input: GetHandRangeInput
): Promise<GetHandRangeOutput> {
  return getHandRangeFlow(input);
}

const getHandRangePrompt = ai.definePrompt({
  name: 'getHandRangePrompt',
  input: {schema: GetHandRangeInputSchema},
  output: {schema: GetHandRangeOutputSchema},
  prompt: `Eres un experto en poker GTO. Tu única función es devolver el rango de manos preflop completo para el siguiente escenario.

*   Posición: {{{position}}}
*   Stack: {{{stackSize}}} BB
*   Mesa: {{{tableType}}}

**Instrucciones:**
1.  **Output:** Devuelve un objeto JSON que se ajuste al esquema de salida.
2.  **Rango Completo:** El objeto 'range' debe contener TODAS las 169 combinaciones de manos posibles (pares, suited y offsuit).
3.  **Acciones:** Para cada mano, el valor debe ser una de las siguientes tres acciones, basada en una estrategia GTO estándar para un open-raise (o una defensa contra un open-raise si la posición es SB o BB): "raise", "call", o "fold".
    *   Usa "raise" para manos que deberían abrir subiendo la apuesta.
    *   Usa "call" solo cuando sea aplicable (ej. defender en la BB contra un raise). En la mayoría de las posiciones de open-raise, las acciones serán "raise" o "fold".
    *   Usa "fold" para manos que no se deben jugar.
4.  **Sin Explicaciones:** No incluyas explicaciones, solo el objeto JSON con el rango.

Asegúrate de que tu respuesta coincida con el esquema JSON de salida.`,
});

const getHandRangeFlow = ai.defineFlow(
  {
    name: 'getHandRangeFlow',
    inputSchema: GetHandRangeInputSchema,
    outputSchema: GetHandRangeOutputSchema,
  },
  async input => {
    const {output} = await getHandRangePrompt(input);
    return output!;
  }
);
