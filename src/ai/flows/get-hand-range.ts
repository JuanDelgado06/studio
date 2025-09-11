
'use server';
/**
 * @fileOverview Provides a detailed GTO hand range for a specific preflop scenario.
 *
 * - getHandRange - Generates the hand range.
 * - GetHandRangeInput - The input type for getHandrange.
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
  range: HandActionSchema.describe(
    'An object where keys are hand notations (e.g., AKs, 77, T9o) and values are the optimal action: "raise", "call", or "fold". Include all 169 possible hand combinations.'
  ),
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
1.  **Output JSON:** Devuelve un único objeto JSON que se ajuste al esquema de salida.
2.  **Rango Completo (169 manos):** El objeto 'range' debe contener TODAS las 169 combinaciones de manos posibles.
    *   **Pares:** 13 combinaciones (AA, KK, ..., 22).
    *   **Suited:** 78 combinaciones (AKs, AQs, ..., 32s). Usa la notación 's'.
    *   **Offsuit:** 78 combinaciones (AKo, AQo, ..., 32o). Usa la notación 'o'.
3.  **Acciones Válidas:** Para cada mano, el valor DEBE SER una de las siguientes tres strings: "raise", "call", o "fold".
    *   Usa "raise" para manos que deberían abrir subiendo la apuesta.
    *   Usa "call" solo cuando sea aplicable (ej. defender en la BB contra un raise). En la mayoría de las posiciones de open-raise, las acciones serán principalmente "raise" o "fold".
    *   Usa "fold" para manos que no se deben jugar.
4.  **Sin Explicaciones:** No incluyas absolutamente ningún texto, explicación o markdown fuera del objeto JSON. La respuesta debe ser solo el JSON.

Asegúrate de que tu respuesta coincida exactamente con el esquema JSON de salida.`,
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
