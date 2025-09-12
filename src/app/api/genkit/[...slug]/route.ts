/**
 * @fileoverview This file is the entrypoint for Genkit in a Next.js app.
 *
 * It is used to expose the Genkit API to the client.
 */

import {createNextApiHandler} from '@genkit-ai/next';
import {adaptDifficultyBasedOnProgress} from '@/ai/flows/adapt-difficulty-based-on-progress';
import {analyzePreflopDecision} from '@/ai/flows/analyze-preflop-decision';
import {getPreflopExplanation} from '@/ai/flows/get-preflop-explanation';
import {suggestImprovementExercises} from '@/ai/flows/suggest-improvement-exercises';

export const {GET, POST} = createNextApiHandler({
  flows: [
    adaptDifficultyBasedOnProgress,
    analyzePreflopDecision,
    getPreflopExplanation,
    suggestImprovementExercises,
  ],
});

export const dynamic = 'force-dynamic';
