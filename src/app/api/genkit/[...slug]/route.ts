
/**
 * @fileoverview This file is the entrypoint for Genkit in a Next.js app.
 *
 * It is used to expose the Genkit API to the client.
 */

import {genkitNextHandler} from '@genkit-ai/next';
import '@/ai/flows/adapt-difficulty-based-on-progress.ts';
import '@/ai/flows/analyze-preflop-decision.ts';
import '@/ai/flows/suggest-improvement-exercises.ts';
import '@/ai/flows/get-preflop-explanation.ts';

export const GET = genkitNextHandler();
export const POST = genkitNextHandler();

export const dynamic = 'force-dynamic';
