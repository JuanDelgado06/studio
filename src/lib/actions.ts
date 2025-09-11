
'use server';

import { analyzePreflopDecision } from "@/ai/flows/analyze-preflop-decision";
import { adaptDifficultyBasedOnProgress } from "@/ai/flows/adapt-difficulty-based-on-progress";
import { getPreflopExplanation } from "@/ai/flows/get-preflop-explanation";
import { suggestImprovementExercises as suggestImprovementExercisesFlow } from "@/ai/flows/suggest-improvement-exercises";
import { getHandRange } from "@/ai/flows/get-hand-range";
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

const SuggestImprovementExercisesSchema = z.object({
    decisionRecords: z.string(),
});

export async function suggestImprovementExercises(input: z.infer<typeof SuggestImprovementExercisesSchema>) {
    try {
        const validatedInput = SuggestImprovementExercisesSchema.parse(input);
        const result = await suggestImprovementExercisesFlow(validatedInput);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Invalid input for suggesting exercises.' };
        }
        console.error(error);
        return { success: false, error: 'Failed to get suggested exercises from AI.' };
    }
}

const HandRangeSchema = z.object({
    position: z.string(),
    stackSize: z.number(),
    tableType: z.enum(['cash', 'tournament']),
});

export async function getHandRangeAction(input: z.infer<typeof HandRangeSchema>) {
    try {
        const validatedInput = HandRangeSchema.parse(input);
        const result = await getHandRange(validatedInput);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error.issues);
            return { success: false, error: 'Invalid input for hand range.' };
        }
        console.error("Error in getHandRangeAction: ", error);
        return { success: false, error: 'Failed to get hand range from AI.' };
    }
}
