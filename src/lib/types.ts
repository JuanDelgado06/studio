import { z } from "zod";

export type Position = 'SB' | 'BB' | 'UTG' | 'MP' | 'CO' | 'BTN';
export type TableType = 'cash' | 'tournament';
export type Action = 'fold' | 'call' | 'raise' | '3-bet' | 'all-in';
export type PreviousAction = 'none' | 'raise' | '3-bet' | '4-bet';
export type Hand = {
    card1: string;
    card2: string;
}
export type HandRange = Record<string, Action>;

export const GenerateGtoRangeInputSchema = z.object({
  position: z.string().describe("The player's position at the table (e.g., 'SB', 'BB', 'UTG')."),
  stackSize: z.number().describe('The player stack size in big blinds.'),
  tableType: z.enum(['cash', 'tournament']).describe('The type of table.'),
  previousAction: z
    .enum(['none', 'raise', '3-bet', '4-bet'])
    .describe(
      'The action that occurred before the player has to act. "none" means it folded to the player.'
    ),
});
export type GenerateGtoRangeInput = z.infer<typeof GenerateGtoRangeInputSchema>;


export const GenerateGtoRangeOutputSchema = z.object({
    raise: z.array(z.string()).optional().describe('Hands to raise. Use range notation (e.g., "77+", "ATs+", "KJo-KTo").'),
    call: z.array(z.string()).optional().describe('Hands to call. Use range notation.'),
    '3-bet': z.array(z.string()).optional().describe('Hands to 3-bet. Use range notation.'),
    'all-in': z.array(z.string()).optional().describe('Hands to go all-in. Use range notation.'),
    fold: z.array(z.string()).optional().describe('Optional. It is assumed any hand not listed is a fold. Use range notation.'),
}).describe('A JSON object representing the GTO hand range for the given scenario.');
export type GenerateGtoRangeOutput = z.infer<typeof GenerateGtoRangeOutputSchema>;

// Schema specifically for validating data coming from the DB, allowing other fields.
export const GtoRangeFromDbSchema = GenerateGtoRangeOutputSchema.passthrough();

export const GetOrGenerateRangeSchema = z.object({
  position: z.nativeEnum({SB: 'SB', BB: 'BB', UTG: 'UTG', MP: 'MP', CO: 'CO', BTN: 'BTN'}),
  stackSize: z.number(),
  tableType: z.enum(['cash', 'tournament']),
  previousAction: z.enum(['none', 'raise', '3-bet', '4-bet']),
});

export const GtoRangeDocumentSchema = z.object({
    position: z.nativeEnum({SB: 'SB', BB: 'BB', UTG: 'UTG', MP: 'MP', CO: 'CO', BTN: 'BTN'}),
    stackRange: z.object({ min: z.number(), max: z.number() }),
    tableType: z.enum(['cash', 'tournament']),
    previousAction: z.enum(['none', 'raise', '3-bet', '4-bet']),
    range: GenerateGtoRangeOutputSchema,
}).passthrough();
export type GtoRangeScenario = z.infer<typeof GtoRangeDocumentSchema>;
    