// This file is machine-generated - edit at your own risk.

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
      'A record of the user’s past preflop poker decisions, including position, hand, stack size, action taken, and whether it was correct.'
    ),
});

export type SuggestImprovementExercisesInput = z.infer<
  typeof SuggestImprovementExercisesInputSchema
>;

const SuggestImprovementExercisesOutputSchema = z.object({
  suggestedExercises: z
    .string()
    .describe(
      'A list of suggested exercises tailored to the user’s error patterns, with explanations of why each exercise is recommended.'
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
  prompt: `You are a poker training coach. Analyze the user’s past decisions and error patterns to suggest tailored exercises.

Past Decisions: {{{decisionRecords}}}

Suggest a list of exercises tailored to the user’s error patterns, with explanations of why each exercise is recommended.
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
