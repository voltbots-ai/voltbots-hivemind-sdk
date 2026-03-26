/**
 * PreToolUse hook for Claude Code.
 *
 * Runs before file write/edit tools. Queries Hivemind for warnings
 * relevant to the file being edited and outputs them so Claude Code
 * can inject them into context.
 *
 * Environment:
 *   HIVEMIND_API_KEY   — required
 *   HIVEMIND_BASE_URL  — optional (defaults to https://api.voltbots.com)
 *   HIVEMIND_PROJECT_ID — required (project identifier)
 *
 * Reads hook input from stdin (JSON with tool_name, tool_input).
 * Writes hook output to stdout.
 */

import { HiveMind, enhancePrompt } from '@voltbots/hivemind';

interface HookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
}

async function main(): Promise<void> {
  const apiKey = process.env['HIVEMIND_API_KEY'];
  const projectId = process.env['HIVEMIND_PROJECT_ID'];

  if (!apiKey || !projectId) {
    // Silently pass through — don't block the tool
    process.stdout.write(JSON.stringify({ decision: 'approve' }));
    return;
  }

  let input: HookInput;
  try {
    const raw = await readStdin();
    input = JSON.parse(raw) as HookInput;
  } catch {
    process.stdout.write(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Extract file path from tool input
  const filePath =
    typeof input.tool_input['file_path'] === 'string'
      ? input.tool_input['file_path']
      : typeof input.tool_input['path'] === 'string'
        ? input.tool_input['path']
        : undefined;

  try {
    const client = new HiveMind({
      apiKey,
      baseUrl: process.env['HIVEMIND_BASE_URL'],
      source: 'claude-code',
      maxRetries: 1,
      timeout: 5_000,
    });

    const warnings = await client.getWarnings({
      projectId,
      filePath,
      authorFamily: 'anthropic',
    });

    if (warnings.injectionText) {
      process.stdout.write(JSON.stringify({
        decision: 'approve',
        message: warnings.injectionText,
      }));
    } else {
      process.stdout.write(JSON.stringify({ decision: 'approve' }));
    }
  } catch {
    // Never block the tool on Hivemind failure
    process.stdout.write(JSON.stringify({ decision: 'approve' }));
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

main().catch(() => {
  process.stdout.write(JSON.stringify({ decision: 'approve' }));
});
