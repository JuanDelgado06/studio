
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting improvement exercises based on user's error patterns in preflop poker training.
 *
 * The flow takes a record of the user's past decisions, analyzes error patterns, and suggests tailored exercises.
 * It exports:
 * - `suggestImprovementExercises`: The main function to invoke the flow.
 * - `SuggestImprovementExercisesInput`: The input type for the flow.
 * - `SuggestImprovementExercisesOutput`: The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestImprovementExercisesInputSchema = z.object({
  decisionRecords: z
    .string()
    .describe(
      'A JSON string array of the user’s past preflop poker decisions, including position, hand, stack size, action taken, and whether it was correct.'
    ),
});

export type SuggestImprovementExercisesInput = z.infer<
  typeof SuggestImprovementExercisesInputSchema
>;

const SuggestImprovementExercisesOutputSchema = z.object({
  suggestedExercises: z
    .string()
    .describe(
      'A formatted string of suggested exercises tailored to the user’s error patterns, with explanations of why each exercise is recommended. Each exercise should be a separate paragraph.'
    ),
});

export type SuggestImprovementExercisesOutput = z.infer<
  typeof SuggestImprovementExercisesOutputSchema
>;

export async function suggestImprovementExercises(
  input: SuggestImprovementExercisesInput
): Promise<SuggestImprovementExercisesOutput> {
  return suggestImprovementExercisesFlow(input);
}

const suggestImprovementExercisesPrompt = ai.definePrompt({
  name: 'suggestImprovementExercisesPrompt',
  input: {schema: SuggestImprovementExercisesInputSchema},
  output: {schema: SuggestImprovementExercisesOutputSchema},
  prompt: `Eres un coach de poker experto que se comunica en español. Tu objetivo es analizar el historial de decisiones de un usuario para identificar patrones de error y sugerir ejercicios personalizados para mejorar.

Historial de Decisiones (en formato JSON):
{{{decisionRecords}}}

**Instrucciones:**
1.  **Idioma:** Responde **completamente en español**.
2.  **Análisis:** Analiza el JSON para encontrar los errores más frecuentes del jugador. Considera la posición, el tipo de mano y la acción.
3.  **Ejercicios:** Basado en los errores, genera 2-3 ejercicios **prácticos y específicos**.
    *   Cada ejercicio debe apuntar a un error concreto.
    *   Explica claramente por qué el ejercicio es útil para corregir ese error.
    *   El tono debe ser alentador y constructivo.
4.  **Terminología:** **NO traduzcas** términos comunes de poker como 'equity', 'range', 'fold', 'call', 'raise', 'GTO', 'EV', 'pot odds'.
5.  **Formato:** Devuelve el texto como un solo string, con cada ejercicio en un párrafo separado. No uses listas ni markdown.

**Ejemplo de Salida Esperada:**

"Para mejorar tu juego en las ciegas, te sugiero un ejercicio de defensa de BB. Enfócate en defender tu Big Blind con un range más amplio contra un open-raise desde BTN. Revisa tablas de GTO y practica defendiendo manos como K7s o A5o. Esto te ayudará a no ser explotado por raises tardíos.

He notado que a veces haces call con manos dominadas en middle position. Un buen ejercicio es filtrar tu range de MP. Juega solo el top 15% de las manos desde esta posición durante tus próximas 100 manos. El objetivo es internalizar la fuerza relativa de las manos y evitar situaciones de alto riesgo con EV negativo."
`,
});

const suggestImprovementExercisesFlow = ai.defineFlow(
  {
    name: 'suggestImprovementExercisesFlow',
    inputSchema: SuggestImprovementExercisesInputSchema,
    outputSchema: SuggestImprovementExercisesOutputSchema,
  },
  async input => {
    const {output} = await suggestImprovementExercisesPrompt(input);
    return output!;
  }
);
