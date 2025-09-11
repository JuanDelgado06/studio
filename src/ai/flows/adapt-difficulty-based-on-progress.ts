'use server';
/**
 * @fileOverview This file defines a Genkit flow that adapts the difficulty of the poker training app based on the user's progress.
 *
 * - adaptDifficultyBasedOnProgress - A function that adjusts the difficulty level.
 * - AdaptDifficultyBasedOnProgressInput - The input type for the adaptDifficultyBasedOnProgress function.
 * - AdaptDifficultyBasedOnProgressOutput - The return type for the adaptDifficultyBasedOnProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptDifficultyBasedOnProgressInputSchema = z.object({
  userStats: z
    .object({
      overallAccuracy: z.number().describe('The overall accuracy of the user in making preflop decisions (0 to 1).'),
      positionalAccuracy: z.record(z.string(), z.number()).describe('A map of accuracy by position (e.g., SB, BB, UTG) with values from 0 to 1.'),
      handTypeAccuracy: z.record(z.string(), z.number()).describe('A map of accuracy by hand type (e.g., suited connectors, pocket pairs) with values from 0 to 1.'),
      commonMistakes: z.array(z.string()).describe('An array of strings describing common mistakes the user makes.'),
      weeklyGoalSuccessRate: z.number().describe('The success rate of the user achieving their weekly goals (0 to 1).'),
    })
    .describe('The user stats, including overall accuracy, accuracy by position and hand type, common mistakes, and weekly goal success rate.'),
  currentDifficulty: z
    .string()
    .describe('The current difficulty level of the app (e.g., beginner, intermediate, advanced).'),
});
export type AdaptDifficultyBasedOnProgressInput = z.infer<
  typeof AdaptDifficultyBasedOnProgressInputSchema
>;

const AdaptDifficultyBasedOnProgressOutputSchema = z.object({
  newDifficulty: z.string().describe('The new difficulty level of the app (e.g., beginner, intermediate, advanced).'),
  suggestedFocusAreas: z
    .array(z.string())
    .describe(
      'An array of strings describing areas the user should focus on to improve their game, based on their stats. Each string should be a short, actionable suggestion.'
    ),
  newRanges: z.string().optional().describe('An adapted hand range based on user progress.'),
});

export type AdaptDifficultyBasedOnProgressOutput = z.infer<
  typeof AdaptDifficultyBasedOnProgressOutputSchema
>;

export async function adaptDifficultyBasedOnProgress(
  input: AdaptDifficultyBasedOnProgressInput
): Promise<AdaptDifficultyBasedOnProgressOutput> {
  return adaptDifficultyBasedOnProgressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptDifficultyBasedOnProgressPrompt',
  input: {schema: AdaptDifficultyBasedOnProgressInputSchema},
  output: {schema: AdaptDifficultyBasedOnProgressOutputSchema},
  prompt: `You are an AI poker coach that adapts content difficulty based on user performance. Your response should be in Spanish.

You are provided with user statistics and the current difficulty level.

User Stats:
{{json userStats}}

Current Difficulty: {{{currentDifficulty}}}

Based on this information, determine the new difficulty level and suggest focus areas for the user.

**Instructions:**
1.  **Language:** Respond **completely in Spanish**.
2.  **Terminology:** **DO NOT translate** common poker terms like 'equity', 'range', 'fold', 'call', 'raise', 'GTO', 'EV', 'pot odds', 'nuts', 'bluff', 'semi-bluff', 'implied odds'.
3.  **Focus Areas:** The focus areas must be an array of short, actionable suggestions.

Difficulty levels:
- beginner
- intermediate
- advanced

Respond in a JSON format that matches the output schema.
`,
});

const adaptDifficultyBasedOnProgressFlow = ai.defineFlow(
  {
    name: 'adaptDifficultyBasedOnProgressFlow',
    inputSchema: AdaptDifficultyBasedOnProgressInputSchema,
    outputSchema: AdaptDifficultyBasedOnProgressOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
