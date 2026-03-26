#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { HiveMind } from '@voltbots/hivemind';
import { createServer } from './server.js';

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

const server = createServer(client);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server failed to start:', err);
  process.exit(1);
});
