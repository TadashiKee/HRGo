
'use server';
/**
 * @fileOverview An AI flow to summarize employee feedback.
 *
 * - summarizeFeedback - A function that takes feedback and returns a summary.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeFeedbackInputSchema = z.array(z.string());

const SummarizeFeedbackOutputSchema = z.string();

export async function summarizeFeedback(
  input: z.infer<typeof SummarizeFeedbackInputSchema>
): Promise<z.infer<typeof SummarizeFeedbackOutputSchema>> {
  return summarizeFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFeedbackPrompt',
  input: { schema: SummarizeFeedbackInputSchema },
  output: { schema: SummarizeFeedbackOutputSchema },
  prompt: `You are an expert HR analyst. You have received the following pieces of anonymous feedback from employees.
Your task is to synthesize this feedback into a concise, insightful summary for the company owner.

Do not address the owner directly. Just provide the summary.
Identify the main recurring themes, whether positive or negative.
Group similar comments together in your analysis.
Highlight any actionable suggestions.
Maintain a neutral, professional tone.

Here is the feedback:
{{#each this}}
- "{{this}}"
{{/each}}

Please provide your summary below:
`,
});

const summarizeFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackFlow',
    inputSchema: SummarizeFeedbackInputSchema,
    outputSchema: SummarizeFeedbackOutputSchema,
  },
  async (feedbackItems) => {
    if (feedbackItems.length === 0) {
      return 'No feedback provided to summarize.';
    }
    const { output } = await prompt(feedbackItems);
    return output!;
  }
);
