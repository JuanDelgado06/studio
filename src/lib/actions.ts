
'use server';

import { adaptDifficultyBasedOnProgress } from "@/ai/flows/adapt-difficulty-based-on-progress";
import { getPreflopExplanation } from "@/ai/flows/get-preflop-explanation";
import { suggestImprovementExercises as suggestImprovementExercisesFlow } from "@/ai/flows/suggest-improvement-exercises";
import { z } from "zod";
import { generateGtoRange } from "@/ai/flows/generate-gto-range";
import clientPromise from "./mongodb";
import { GenerateGtoRangeOutput, GetOrGenerateRangeSchema, GtoRangeDocumentSchema } from "./types";
import type { GetPreflopExplanationOutput } from "@/ai/flows/get-preflop-explanation";

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

// Helper function to determine stack bracket
function getStackBracket(stackSize: number): { min: number; max: number } {
  if (stackSize <= 20) return { min: 1, max: 20 };
  if (stackSize <= 70) return { min: 21, max: 70 };
  return { min: 71, max: 100 };
}


// Server Action for fetching/generating GTO ranges
export async function getOrGenerateRangeAction(input: z.infer<typeof GetOrGenerateRangeSchema>): Promise<{ success: boolean; data?: GenerateGtoRangeOutput | null; error?: string; source?: 'db' | 'ai' }> {
  try {
    const validatedInput = GetOrGenerateRangeSchema.parse(input);
    const client = await clientPromise;
    const db = client.db("poker-pro");
    const rangesCollection = db.collection("gto-ranges");

    const stackBracket = getStackBracket(validatedInput.stackSize);

    const query = {
        position: validatedInput.position,
        tableType: validatedInput.tableType,
        previousAction: validatedInput.previousAction,
        stackRange: stackBracket,
    };
    
    const existingRangeDoc = await rangesCollection.findOne(query);
    
    if (existingRangeDoc) {
      const parsedDoc = GtoRangeDocumentSchema.extend({ range: GenerateGtoRangeOutputSchema }).safeParse(existingRangeDoc);
      if (parsedDoc.success) {
        return { success: true, data: parsedDoc.data.range, source: 'db' };
      }
    }

    const generatedRange = await generateGtoRange(validatedInput);

    if (!generatedRange) {
      throw new Error("AI failed to generate a range.");
    }
    
    const newRangeDoc = {
      ...query,
      range: generatedRange,
      createdAt: new Date(),
    };

    await rangesCollection.insertOne(newRangeDoc);

    return { success: true, data: generatedRange, source: 'ai' };

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod Error in getOrGenerateRangeAction:", error.flatten());
      return { success: false, error: "Invalid input for range generation." };
    }
    console.error("Error in getOrGenerateRangeAction:", error);
    return { success: false, error: "Failed to get or generate range." };
  }
}

export async function getDbRangesKeys(): Promise<{ success: boolean; data?: z.infer<typeof GtoRangeDocumentSchema>[], error?: string; }> {
    try {
        const client = await clientPromise;
        const db = client.db("poker-pro");
        const rangesCollection = db.collection("gto-ranges");
        const ranges = await rangesCollection.find({}, { projection: { range: 0, createdAt: 0, _id: 0 } }).toArray();
        
        const scenarios = ranges.map(r => GtoRangeDocumentSchema.parse(r));

        return { success: true, data: scenarios };
    } catch (error) {
        console.error("Error fetching range keys:", error);
        return { success: false, error: "Failed to fetch range keys from database." };
    }
}


// Updated action to cache explanations using stack brackets
export async function getPreflopExplanationAction(input: z.infer<typeof PreflopExplanationSchema>): Promise<{ success: boolean; data?: GetPreflopExplanationOutput | null; error?: string; source?: 'db' | 'ai' }> {
    try {
        const validatedInput = PreflopExplanationSchema.parse(input);
        const client = await clientPromise;
        const db = client.db("poker-pro");
        const explanationsCollection = db.collection("explanations");
        
        const stackBracket = getStackBracket(validatedInput.stackSize);
        
        const { stackSize, betSize, ...queryWithoutStack } = validatedInput;

        const query = {
            ...queryWithoutStack,
            stackRange: stackBracket,
        };
        
        // 1. Try to find the explanation in the database using the stack bracket
        const existingExplanation = await explanationsCollection.findOne(query);
        
        if (existingExplanation) {
            return {
                success: true,
                data: {
                    feedback: existingExplanation.feedback,
                    evExplanation: existingExplanation.evExplanation,
                },
                source: 'db'
            };
        }

        // 2. If not found, generate it with AI
        const generatedExplanation = await getPreflopExplanation(validatedInput);
        
        if (!generatedExplanation) {
            throw new Error("AI failed to generate an explanation.");
        }

        // 3. Save the new explanation to the database with the stack bracket
        const documentToInsert = {
            ...query,
            ...generatedExplanation,
            createdAt: new Date(),
        };
        await explanationsCollection.insertOne(documentToInsert);

        return { success: true, data: generatedExplanation, source: 'ai' };

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: "Invalid input for explanation." };
        }
        console.error("Error in getPreflopExplanationAction:", error);
        return { success: false, error: "Failed to get or generate explanation." };
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
