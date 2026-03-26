/**
 * @voltbots/claude-code-plugin
 *
 * Claude Code integration for VoltBots Hivemind.
 *
 * This package provides:
 * - PreToolUse hook: injects warnings before file edits
 * - PostToolUse hook: captures tool traces for learning
 *
 * See settings.example.json for Claude Code configuration.
 */

export { HiveMind, enhancePrompt } from '@voltbots/hivemind';
export type { WarningsResponse, Warning } from '@voltbots/hivemind';
