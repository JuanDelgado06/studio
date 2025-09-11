'use server';

import { analyzePreflopDecision } from "@/ai/flows/analyze-preflop-decision";
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
