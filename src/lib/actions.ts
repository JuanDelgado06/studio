
'use server';

import { adaptDifficultyBasedOnProgress } from "@/ai/flows/adapt-difficulty-based-on-progress";
import { getPreflopExplanation } from "@/ai/flows/get-preflop-explanation";
import { suggestImprovementExercises as suggestImprovementExercisesFlow } from "@/ai/flows/suggest-improvement-exercises";
import { z } from "zod";
import { generateGtoRange } from "@/ai/flows/generate-gto-range";
import clientPromise from "./mongodb";
import { GenerateGtoRangeInputSchema, GenerateGtoRangeOutput, GetOrGenerateRangeSchema } from "./types";

// Zod Schemas for input validation
const PreflopDecisionSchema = z.object({
  position: z.string(),
  stackSize: z.number(),
  tableType: z.enum(['cash', 'tournament']),
  hand: z.string(),
  action: z.enum(['fold', 'call', 'raise', '3-bet', 'all-in']),
  betSize: z.number().optional(),
});

const PreflopExplanationSchema = PreflopDecisionSchema.extend({
    isOptimal: z.boolean(),
});


// Server Action for fetching/generating GTO ranges
export async function getOrGenerateRangeAction(input: z.infer<typeof GetOrGenerateRangeSchema>): Promise<{ success: boolean; data?: GenerateGtoRangeOutput | null; error?: string; source?: 'db' | 'ai' }> {
  try {
    const validatedInput = GetOrGenerateRangeSchema.parse(input);
    const client = await clientPromise;
    const db = client.db("poker-pro");
    const rangesCollection = db.collection("gto-ranges");

    const scenarioKey = `${validatedInput.position}-${validatedInput.stackSize}-${validatedInput.tableType}-${validatedInput.previousAction}`;
    
    // 1. Try to find the range in the database
    const existingRange = await rangesCollection.findOne({ key: scenarioKey });

    if (existingRange) {
      return { success: true, data: existingRange.range, source: 'db' };
    }

    // 2. If not found, generate it with AI
    const generatedRange = await generateGtoRange(validatedInput);

    if (!generatedRange) {
      throw new Error("AI failed to generate a range.");
    }

    // 3. Save the newly generated range to the database
    await rangesCollection.insertOne({ key: scenarioKey, range: generatedRange, createdAt: new Date() });

    return { success: true, data: generatedRange, source: 'ai' };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input for range generation." };
    }
    console.error("Error in getOrGenerateRangeAction:", error);
    return { success: false, error: "Failed to get or generate range." };
  }
}


// Existing Server Actions
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
