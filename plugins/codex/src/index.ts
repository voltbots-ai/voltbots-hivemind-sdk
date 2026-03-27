/**
 * @voltbots/codex-plugin
 *
 * OpenAI Codex CLI integration for VoltBots Hivemind.
 *
 * Provides the same Hivemind capabilities as the Claude Code plugin
 * but configured for the Codex CLI environment.
 *
 * Usage:
 *   The Codex CLI supports MCP servers. Configure it to use
 *   @voltbots/mcp-hivemind for full Hivemind access.
 *
 * For hook-based integration, this module exports a pre-configured
 * HiveMind client with source set to 'codex'.
 */

import { HiveMind } from '@voltbots/hivemind';
import type { HiveMindOptions } from '@voltbots/hivemind';

export function createCodexClient(
  options: Omit<HiveMindOptions, 'source'>,
): HiveMind {
  return new HiveMind({
    ...options,
    source: 'codex',
  });
}

export { HiveMind, enhancePrompt } from '@voltbots/hivemind';
export type { WarningsResponse, Warning, HiveMindOptions } from '@voltbots/hivemind';
