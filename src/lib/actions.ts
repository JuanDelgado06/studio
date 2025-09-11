'use server';

import { analyzePreflopDecision } from "@/ai/flows/analyze-preflop-decision";
import { adaptDifficultyBasedOnProgress } from "@/ai/flows/adapt-difficulty-based-on-progress";
import { getPreflopExplanation } from "@/ai/flows/get-preflop-explanation";
import { z } from "zod";

const PreflopDecisionSchema = z.object({
  position: z.string(),
  stackSize: z.number(),
  tableType: z.enum(['cash', 'tournament']),
  hand: z.string(),
  action: z.enum(['fold', 'call', 'raise']),
  betSize: z.number().optional(),
});

export async function getPreflopAnalysis(input: z.infer<typeof PreflopDecisionSchema>) {
    try {
        const validatedInput = PreflopDecisionSchema.parse(input);
        const result = await analyzePreflopDecision(validatedInput);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: "Invalid input." };
        }
        console.error(error);
        return { success: false, error: "Failed to get analysis from AI." };
    }
}

const PreflopExplanationSchema = PreflopDecisionSchema.extend({
    isOptimal: z.boolean(),
});

export async function getPreflopExplanationAction(input: z.infer<typeof PreflopExplanationSchema>) {
    try {
        const validatedInput = PreflopExplanationSchema.parse(input);
        const result = await getPreflopExplanation(validatedInput);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: "Invalid input for explanation." };
        }
        console.error(error);
        return { success: false, error: "Failed to get explanation from AI." };
    }
}


const AdaptDifficultySchema = z.object({
  userStats: z.object({
    overallAccuracy: z.number(),
    positionalAccuracy: z.record(z.string(), z.number()),
    handTypeAccuracy: z.record(z.string(), z.number()),
    commonMistakes: z.array(z.string()),
    weeklyGoalSuccessRate: z.number(),
  }),
  currentDifficulty: z.string(),
});

export async function getAdaptedDifficulty(input: z.infer<typeof AdaptDifficultySchema>) {
  try {
    const validatedInput = AdaptDifficultySchema.parse(input);
    const result = await adaptDifficultyBasedOnProgress(validatedInput);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input for difficulty adaptation.' };
    }
    console.error(error);
    return { success: false, error: 'Failed to get adapted difficulty from AI.' };
  }
}
