
'use server';
/**
 * @fileOverview Defines a Genkit flow for generating preflop GTO poker ranges.
 *
 * This flow takes a poker scenario (position, stack size, etc.) and uses an AI model
 * to generate a Game Theory Optimal (GTO) hand range in a specific JSON format.
 *
 * It exports:
 * - `generateGtoRange`: The main function to invoke the flow.
 */

import { ai } from '@/ai/genkit';
import type { GenerateGtoRangeInput, GenerateGtoRangeOutput } from '@/lib/types';
import { GenerateGtoRangeInputSchema, GenerateGtoRangeOutputSchema } from '@/lib/types';


export async function generateGtoRange(
  input: GenerateGtoRangeInput
): Promise<GenerateGtoRangeOutput> {
  return generateGtoRangeFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateGtoRangePrompt',
  input: { schema: GenerateGtoRangeInputSchema },
  output: { schema: GenerateGtoRangeOutputSchema },
  prompt: `You are an expert poker AI that generates GTO (Game Theory Optimal) preflop ranges. Your response must be in Spanish.

You will be given a specific preflop scenario and you must return the corresponding GTO range in a structured JSON format.

**Scenario Details:**
*   **Position:** {{{position}}}
*   **Stack Size:** {{{stackSize}}} BB
*   **Table Type:** {{{tableType}}}
*   **Previous Action:** {{{previousAction}}} (This is the action you are facing. 'none' means it has folded to you.)

**Output Instructions:**
1.  **JSON Format:** Your output **must** be a valid JSON object that strictly adheres to the provided output schema.
2.  **Range Notation:** Use standard poker range notation.
    *   For pairs: \`JJ+\` (JJ, QQ, KK, AA), \`TT-88\` (TT, 99, 88).
    *   For suited/offsuit hands: \`ATs+\` (ATs, AJs, AQs, AKs), \`KQo\`.
    *   For ranges within a hand: \`T9s-T7s\` (T9s, T8s, T7s).
3.  **Completeness:** Provide ranges for all relevant actions (raise, call, 3-bet, all-in). It is assumed that any hand not specified in an action is a 'fold'.
4.  **DO NOT** include any explanations, comments, or text outside of the JSON object. Your entire response must be the JSON object itself.

**Example for SB open raise at 100bb:**
If the input is \`{ "position": "SB", "stackSize": 100, "tableType": "cash", "previousAction": "none" }\`, a correct output would be:
\`\`\`json
{
  "raise": ["22+", "A2s+", "K2s+", "Q2s+", "J4s+", "T6s+", "97s+", "87s", "A2o+", "K8o+", "Q9o+", "JTo"],
  "call": []
}
\`\`\`

Now, generate the range for the provided scenario.
`,
});

const generateGtoRangeFlow = ai.defineFlow(
  {
    name: 'generateGtoRangeFlow',
    inputSchema: GenerateGtoRangeInputSchema,
    outputSchema: GenerateGtoRangeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
