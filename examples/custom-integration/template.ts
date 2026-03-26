/**
 * VoltBots Hivemind — Custom Integration Template
 *
 * Use this as a starting point for building your own integration.
 * The pattern is simple:
 *   1. Before AI acts → getWarnings() → inject into prompt
 *   2. After AI acts → submitTrace() → capture for learning
 *   3. On error → reportMistake() → feed the knowledge base
 */

import { HiveMind, enhancePrompt } from '@voltbots/hivemind';
import type { WarningsResponse } from '@voltbots/hivemind';

// Initialize the client
const hivemind = new HiveMind({
  apiKey: process.env.HIVEMIND_API_KEY!,
  source: 'sdk', // Change to identify your integration
});

const PROJECT_ID = 'your-project-id';

/**
 * Step 1: Before AI generation — inject warnings into the prompt.
 */
async function beforeGeneration(
  prompt: string,
  model: string,
  filePath?: string,
): Promise<string> {
  try {
    const warnings = await hivemind.getWarnings({
      projectId: PROJECT_ID,
      filePath,
      authorModel: model,
    });

    return enhancePrompt(prompt, warnings);
  } catch {
    // Never block generation on Hivemind failure
    return prompt;
  }
}

/**
 * Step 2: After AI tool execution — capture the trace.
 */
async function afterToolExecution(
  toolName: string,
  model: string,
  input: unknown,
  output: unknown,
  success: boolean,
  durationMs: number,
  error?: string,
): Promise<void> {
  try {
    await hivemind.submitTrace({
      projectId: PROJECT_ID,
      tool: toolName,
      model,
      family: 'anthropic', // Set to your model's family
      tier: 'balanced',
      input,
      output,
      success,
      duration: durationMs,
      error,
    });
  } catch {
    // Fire and forget
  }
}

/**
 * Step 3: On error — report the mistake.
 */
async function onMistakeDetected(
  description: string,
  model: string,
  errorType: string,
): Promise<void> {
  try {
    await hivemind.reportMistake({
      projectId: PROJECT_ID,
      errorType,
      description,
      rootCause: 'AI-generated code contained an error',
      prevention: 'Check for this pattern before applying changes',
      severity: 'medium',
      model,
      family: 'anthropic',
      tier: 'balanced',
    });
  } catch {
    // Non-critical
  }
}

// Export for use in your integration
export { beforeGeneration, afterToolExecution, onMistakeDetected };
