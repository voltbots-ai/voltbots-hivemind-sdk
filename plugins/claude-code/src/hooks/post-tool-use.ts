/**
 * PostToolUse hook for Claude Code.
 *
 * Runs after any tool execution. Captures the tool trace and sends
 * it to Hivemind for learning. Fire-and-forget — never blocks.
 *
 * Environment:
 *   HIVEMIND_API_KEY    — required
 *   HIVEMIND_BASE_URL   — optional
 *   HIVEMIND_PROJECT_ID — required
 *   HIVEMIND_MODEL      — optional (default: claude-sonnet-4)
 *   HIVEMIND_FAMILY     — optional (default: anthropic)
 *   HIVEMIND_TIER       — optional (default: balanced)
 */

import { HiveMind } from '@voltbots/hivemind';
import type { ProviderFamily } from '@voltbots/hivemind';

interface HookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_output?: unknown;
  error?: string;
  duration_ms?: number;
}

async function main(): Promise<void> {
  const apiKey = process.env['HIVEMIND_API_KEY'];
  const projectId = process.env['HIVEMIND_PROJECT_ID'];

  if (!apiKey || !projectId) return;

  let input: HookInput;
  try {
    const raw = await readStdin();
    input = JSON.parse(raw) as HookInput;
  } catch {
    return;
  }

  try {
    const client = new HiveMind({
      apiKey,
      baseUrl: process.env['HIVEMIND_BASE_URL'],
      source: 'claude-code',
      maxRetries: 1,
      timeout: 5_000,
    });

    await client.submitTrace({
      projectId,
      tool: input.tool_name,
      model: process.env['HIVEMIND_MODEL'] ?? 'claude-sonnet-4',
      family: (process.env['HIVEMIND_FAMILY'] ?? 'anthropic') as ProviderFamily,
      tier: process.env['HIVEMIND_TIER'] ?? 'balanced',
      input: input.tool_input,
      output: input.tool_output ?? null,
      success: !input.error,
      duration: input.duration_ms ?? 0,
      error: input.error,
    });
  } catch {
    // Fire and forget — never fail
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (chunk: Buffer) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    process.stdin.on('error', reject);
  });
}

main().catch(() => {});
