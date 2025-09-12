/**
 * @fileoverview This file is the entrypoint for Genkit in a Next.js app.
 *
 * It is used to expose the Genkit API to the client.
 */

import {createNextApiHandler} from '@genkit-ai/next';
import * as adaptDifficultyFlow from '@/ai/flows/adapt-difficulty-based-on-progress';
import * as analyzePreflopDecisionFlow from '@/ai/flows/analyze-preflop-decision';
import * as getPreflopExplanationFlow from '@/ai/flows/get-preflop-explanation';
import * as suggestImprovementExercisesFlow from '@/ai/flows/suggest-improvement-exercises';

export const {GET, POST} = createNextApiHandler({
  flows: [
    ...Object.values(adaptDifficultyFlow),
    ...Object.values(analyzePreflopDecisionFlow),
    ...Object.values(getPreflopExplanationFlow),
    ...Object.values(suggestImprovementExercisesFlow),
  ],
});

export const dynamic = 'force-dynamic';
