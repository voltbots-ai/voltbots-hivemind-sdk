import { describe, it, expect, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { HiveMind } from '@voltbots/hivemind';
import { createServer } from '../src/server.js';

function mockClient(overrides: Partial<HiveMind> = {}): HiveMind {
  return {
    getWarnings: vi.fn().mockResolvedValue({ warnings: [], injectionText: null, meta: {} }),
    submitReview: vi.fn().mockResolvedValue({
      findings: [], reviewerBot: 'atlas', reviewerModel: 'gpt-5',
      reviewerTier: 'flagship', reviewerFamily: 'openai', meta: {},
    }),
    submitTrace: vi.fn().mockResolvedValue({ recorded: false, mistakesDetected: [], meta: {} }),
    reportMistake: vi.fn().mockResolvedValue({ mistakeId: 'mk_test' }),
    searchMemory: vi.fn().mockResolvedValue({ memories: [] }),
    writeMemory: vi.fn().mockResolvedValue({ memoryId: 'mem_test' }),
    getInsights: vi.fn().mockResolvedValue({
      insights: { metric: 'review', recommendation: '', botStats: [] }, meta: {},
    }),
    ...overrides,
  } as unknown as HiveMind;
}

async function setupClientServer(hivemind: HiveMind) {
  const server = createServer(hivemind);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '0.0.1' });
  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);
  return { client, server };
}

describe('MCP Server', () => {
  it('lists all 7 tools', async () => {
    const { client } = await setupClientServer(mockClient());
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      'get_insights', 'get_warnings', 'report_mistake',
      'request_review', 'search_memory', 'submit_trace', 'write_memory',
    ]);
  });

  it('get_warnings returns "no warnings" for empty result', async () => {
    const { client } = await setupClientServer(mockClient());
    const result = await client.callTool({ name: 'get_warnings', arguments: { projectId: 'p1' } });
    expect(result.content).toEqual([{ type: 'text', text: 'No known warnings for this context.' }]);
  });

  it('get_warnings returns injection text when present', async () => {
    const hm = mockClient({
      getWarnings: vi.fn().mockResolvedValue({
        warnings: [{ type: 'null_check', pattern: 'Misses null checks', severity: 'high', prevention: 'Check first', rootCause: 'Assumed non-null', source: 'project', bot: 'cleo' }],
        injectionText: 'KNOWN ISSUES:\n- Misses null checks',
        meta: {},
      }),
    });
    const { client } = await setupClientServer(hm);
    const result = await client.callTool({ name: 'get_warnings', arguments: { projectId: 'p1' } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('KNOWN ISSUES');
  });

  it('report_mistake returns mistake ID', async () => {
    const { client } = await setupClientServer(mockClient());
    const result = await client.callTool({
      name: 'report_mistake',
      arguments: {
        projectId: 'p1', errorType: 'null_check', description: 'test',
        rootCause: 'test', prevention: 'test', severity: 'medium',
        model: 'claude-sonnet-4', family: 'anthropic', tier: 'balanced',
      },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toBe('Mistake recorded: mk_test');
  });

  it('write_memory returns memory ID', async () => {
    const { client } = await setupClientServer(mockClient());
    const result = await client.callTool({
      name: 'write_memory',
      arguments: { projectId: 'p1', content: 'test memory', type: 'decision' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toBe('Memory stored: mem_test');
  });

  it('search_memory returns "no matching" for empty result', async () => {
    const { client } = await setupClientServer(mockClient());
    const result = await client.callTool({
      name: 'search_memory',
      arguments: { projectId: 'p1', query: 'auth' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toBe('No matching memories found.');
  });

  it('request_review passes arguments to SDK client', async () => {
    const submitReview = vi.fn().mockResolvedValue({
      findings: [{ severity: 'high', description: 'SQL injection', line: 5 }],
      reviewerBot: 'atlas', reviewerModel: 'gpt-5',
      reviewerTier: 'flagship', reviewerFamily: 'openai', meta: {},
    });
    const hm = mockClient({ submitReview });
    const { client } = await setupClientServer(hm);

    const result = await client.callTool({
      name: 'request_review',
      arguments: {
        projectId: 'p1', diff: '+ x = 1', filePath: 'app.ts',
        language: 'typescript', authorModel: 'claude-sonnet-4', authorFamily: 'anthropic',
      },
    });

    expect(submitReview).toHaveBeenCalledOnce();
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('SQL injection');
    expect(text).toContain('gpt-5');
  });
});
