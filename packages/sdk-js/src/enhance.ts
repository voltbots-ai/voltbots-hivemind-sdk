import type { WarningsResponse } from './types.js';

/**
 * Prepend HiveMind warnings to a prompt.
 *
 * Uses the server-generated `injectionText` when available.
 * This is a client-side helper — no API call is made.
 */
export function enhancePrompt(
  prompt: string,
  warnings: WarningsResponse,
): string {
  if (!warnings.injectionText) return prompt;

  return `${warnings.injectionText}\n\n---\n\n${prompt}`;
}
