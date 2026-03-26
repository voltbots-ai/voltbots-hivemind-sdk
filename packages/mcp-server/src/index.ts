#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { HiveMind } from '@voltbots/hivemind';

const apiKey = process.env['HIVEMIND_API_KEY'];
if (!apiKey) {
  console.error('HIVEMIND_API_KEY environment variable is required');
  process.exit(1);
}

const client = new HiveMind({
  apiKey,
  baseUrl: process.env['HIVEMIND_BASE_URL'],
  source: 'sdk',
});

const server = new McpServer({
  name: 'voltbots-hivemind',
  version: '0.1.0',
});

// ---------------------------------------------------------------------------
// get_warnings
// ---------------------------------------------------------------------------

server.tool(
  'get_warnings',
  'Get known issues and model-specific warnings for a project. Use before making edits to avoid repeating known mistakes.',
  {
    projectId: z.string().describe('Project identifier'),
    filePath: z.string().optional().describe('File being edited'),
    domain: z.string().optional().describe('Domain filter (e.g. "auth", "database")'),
    authorModel: z.string().optional().describe('Model writing the code (e.g. "claude-sonnet-4")'),
    authorFamily: z.enum(['openai', 'anthropic', 'google', 'xai', 'volt']).optional().describe('AI provider family'),
  },
  async ({ projectId, filePath, domain, authorModel, authorFamily }) => {
    const result = await client.getWarnings({ projectId, filePath, domain, authorModel, authorFamily });

    if (result.warnings.length === 0) {
      return { content: [{ type: 'text' as const, text: 'No known warnings for this context.' }] };
    }

    const text = result.injectionText ?? result.warnings
      .map((w) => `[${w.severity}] ${w.pattern}\n  Prevention: ${w.prevention}`)
      .join('\n\n');

    return { content: [{ type: 'text' as const, text }] };
  },
);

// ---------------------------------------------------------------------------
// request_review
// ---------------------------------------------------------------------------

server.tool(
  'request_review',
  'Request cross-family code review. A model from a different AI family reviews code to catch blind spots.',
  {
    projectId: z.string().describe('Project identifier'),
    diff: z.string().describe('Code diff to review (max 500K chars)'),
    filePath: z.string().describe('Path of the file being reviewed'),
    language: z.string().describe('Programming language'),
    authorModel: z.string().describe('Model that wrote the code'),
    authorFamily: z.enum(['openai', 'anthropic', 'google', 'xai', 'volt']).describe('Author model family'),
    context: z.string().optional().describe('Additional context about the code'),
  },
  async ({ projectId, diff, filePath, language, authorModel, authorFamily, context }) => {
    const result = await client.submitReview({
      projectId, diff, filePath, language, authorModel, authorFamily, context,
    });

    if (result.findings.length === 0) {
      return { content: [{ type: 'text' as const, text: `Review by ${result.reviewerModel} (${result.reviewerFamily}): No issues found.` }] };
    }

    const lines = [
      `Review by ${result.reviewerModel} (${result.reviewerFamily}):`,
      '',
      ...result.findings.map((f, i) =>
        `${i + 1}. [${f.severity}] ${f.description}${f.line ? ` (line ${f.line})` : ''}${f.suggestion ? `\n   Suggestion: ${f.suggestion}` : ''}`
      ),
    ];

    return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
  },
);

// ---------------------------------------------------------------------------
// submit_trace
// ---------------------------------------------------------------------------

server.tool(
  'submit_trace',
  'Record a tool execution trace for learning. Failed traces are auto-detected as mistakes.',
  {
    projectId: z.string().describe('Project identifier'),
    tool: z.string().describe('Tool name (e.g. "write_to_file")'),
    model: z.string().describe('Model that invoked the tool'),
    family: z.enum(['openai', 'anthropic', 'google', 'xai', 'volt']).describe('Model family'),
    tier: z.string().describe('Model tier (e.g. "flagship", "balanced")'),
    input: z.unknown().describe('Tool input'),
    output: z.unknown().describe('Tool output'),
    success: z.boolean().describe('Whether the tool execution succeeded'),
    duration: z.number().describe('Execution time in milliseconds'),
    error: z.string().optional().describe('Error message if failed'),
  },
  async ({ projectId, tool, model, family, tier, input, output, success, duration, error }) => {
    const result = await client.submitTrace({
      projectId, tool, model, family, tier, input, output, success, duration, error,
    });

    const text = result.recorded
      ? `Trace recorded. ${result.mistakesDetected.length} mistake(s) detected.`
      : 'Trace submitted (no mistakes detected).';

    return { content: [{ type: 'text' as const, text }] };
  },
);

// ---------------------------------------------------------------------------
// report_mistake
// ---------------------------------------------------------------------------

server.tool(
  'report_mistake',
  'Report an AI mistake to the Hivemind learning system. High-quality, human-verified data.',
  {
    projectId: z.string().describe('Project identifier'),
    errorType: z.string().describe('Type of error (e.g. "null_check", "off_by_one")'),
    description: z.string().describe('What went wrong'),
    rootCause: z.string().describe('Why the AI made this mistake'),
    prevention: z.string().describe('How to prevent this in the future'),
    severity: z.enum(['low', 'medium', 'high', 'critical']).describe('Severity level'),
    model: z.string().describe('Model that made the mistake'),
    family: z.enum(['openai', 'anthropic', 'google', 'xai', 'volt']).describe('Model family'),
    tier: z.string().describe('Model tier'),
    domain: z.string().optional().describe('Domain (e.g. "auth", "payments")'),
  },
  async ({ projectId, errorType, description, rootCause, prevention, severity, model, family, tier, domain }) => {
    const result = await client.reportMistake({
      projectId, errorType, description, rootCause, prevention, severity, model, family, tier, domain,
    });

    return { content: [{ type: 'text' as const, text: `Mistake recorded: ${result.mistakeId}` }] };
  },
);

// ---------------------------------------------------------------------------
// search_memory
// ---------------------------------------------------------------------------

server.tool(
  'search_memory',
  'Search project memory for persistent context — decisions, preferences, past errors, and environment details.',
  {
    projectId: z.string().describe('Project identifier'),
    query: z.string().describe('Search query'),
  },
  async ({ projectId, query }) => {
    const result = await client.searchMemory({ projectId, query });

    if (result.memories.length === 0) {
      return { content: [{ type: 'text' as const, text: 'No matching memories found.' }] };
    }

    const text = result.memories
      .map((m) => `[${m.type}] ${m.content}${m.tags.length > 0 ? `\n  Tags: ${m.tags.join(', ')}` : ''}`)
      .join('\n\n');

    return { content: [{ type: 'text' as const, text }] };
  },
);

// ---------------------------------------------------------------------------
// write_memory
// ---------------------------------------------------------------------------

server.tool(
  'write_memory',
  'Store persistent project context that follows users across tools and sessions.',
  {
    projectId: z.string().describe('Project identifier'),
    content: z.string().describe('Memory content to store'),
    type: z.enum(['decision', 'error', 'preference', 'context', 'environment', 'user_style']).describe('Memory type'),
    importance: z.enum(['critical', 'important', 'notable']).optional().describe('Importance level'),
    tags: z.array(z.string()).optional().describe('Tags for organization'),
    relatedFiles: z.array(z.string()).optional().describe('Related file paths'),
  },
  async ({ projectId, content, type, importance, tags, relatedFiles }) => {
    const result = await client.writeMemory({ projectId, content, type, importance, tags, relatedFiles });

    return { content: [{ type: 'text' as const, text: `Memory stored: ${result.memoryId}` }] };
  },
);

// ---------------------------------------------------------------------------
// get_insights
// ---------------------------------------------------------------------------

server.tool(
  'get_insights',
  'Get performance insights — bot stats, domain performance, and recommendations.',
  {
    projectId: z.string().optional().describe('Project identifier'),
    botName: z.string().optional().describe('Filter to specific bot'),
    metric: z.string().optional().describe('Metric type (default: "review")'),
  },
  async ({ projectId, botName, metric }) => {
    const result = await client.getInsights({ projectId, botName, metric });

    const lines = [
      `Metric: ${result.insights.metric}`,
      result.insights.recommendation ? `Recommendation: ${result.insights.recommendation}` : '',
      '',
      `Bot stats: ${result.insights.botStats.length} entries`,
      ...result.insights.botStats.slice(0, 5).map((s) => `  ${JSON.stringify(s)}`),
    ].filter(Boolean);

    return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
  },
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server failed to start:', err);
  process.exit(1);
});
