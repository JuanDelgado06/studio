
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
  previousAction: z
    .enum(['none', 'raise'])
    .optional()
    .describe(
      'The action of the player before you. "none" if you are the first to act (open-raise). "raise" if someone raised before you.'
    ),
});
export type GetHandRangeInput = z.infer<typeof GetHandRangeInputSchema>;

const GetHandRangeOutputSchema = z.object({
  raise: z
    .array(z.string())
    .describe(
      "Array of hand notations to raise (e.g., ['AA', 'KK', 'AQs+'])"
    ),
  call: z
    .array(z.string())
    .describe("Array of hand notations to call (e.g., ['77', 'A9s'])"),
  fold: z
    .array(z.string())
    .describe("Array of hand notations to fold (e.g., ['72o', '83s'])"),
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
  prompt: `Eres un experto en poker GTO. Tu única función es devolver los rangos de manos preflop para el siguiente escenario.

*   Posición: {{{position}}}
*   Stack: {{{stackSize}}} BB
*   Mesa: {{{tableType}}}
*   Acción Previa: {{#if previousAction}}{{{previousAction}}}{{else}}'none' (estás abriendo la mano){{/if}}

**Instrucciones:**
1.  **Output JSON:** Devuelve un único objeto JSON que se ajuste al esquema de salida.
2.  **Considera la Acción Previa:** Si 'previousAction' es 'raise', tu rango debe incluir 'call' y '3-bet' (que se clasifica como 'raise'). Si es 'none', el rango será de open-raise o fold.
3.  **Formato de Rango:** Usa notación de rangos de poker para agrupar manos cuando sea posible (ej. 'AQs+', 'TT-88', 'K9s-K6s', 'T8o').
4.  **Acciones:** Proporciona arrays de strings para las acciones 'raise', 'call' y 'fold'.
5.  **Completitud:** Asegúrate de que todos los tipos de manos estén cubiertos. Las manos no mencionadas en 'raise' o 'call' se asumirán como 'fold', pero sé explícito para las manos comúnmente foldeadas.
6.  **Sin Explicaciones:** No incluyas absolutamente ningún texto, explicación o markdown fuera del objeto JSON.

Ejemplo de formato para el array 'raise': ["AA", "KK", "AQs+", "AKo", "JJ-99", "T9s"].

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
