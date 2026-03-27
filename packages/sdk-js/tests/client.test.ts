import { describe, it, expect, vi } from 'vitest';
import { HiveMind } from '../src/client.js';
import {
  AuthError,
  ValidationError,
  RateLimitError,
  PayloadTooLargeError,
  NotImplementedError,
} from '../src/errors.js';

function mockFetch(status: number, body: unknown): typeof globalThis.fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: () => Promise.resolve(body),
  }) as unknown as typeof globalThis.fetch;
}

function createClient(fetchFn: typeof globalThis.fetch): HiveMind {
  return new HiveMind({
    apiKey: 'test-key',
    baseUrl: 'https://test.voltbots.com',
    source: 'sdk',
    fetch: fetchFn,
    maxRetries: 0,
  });
}

describe('HiveMind', () => {
  it('throws if apiKey is empty', () => {
    expect(() => new HiveMind({ apiKey: '' })).toThrow('apiKey is required');
  });

  describe('getWarnings', () => {
    it('sends correct GET request with query params', async () => {
      const body = { warnings: [], injectionText: null, meta: {} };
      const fetch = mockFetch(200, body);
      const client = createClient(fetch);

      const result = await client.getWarnings({
        projectId: 'proj_1',
        filePath: 'src/index.ts',
        authorModel: 'claude-sonnet-4',
        authorFamily: 'anthropic',
      });

      expect(fetch).toHaveBeenCalledOnce();
      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/v1/hivemind/warnings');
      expect(url).toContain('projectId=proj_1');
      expect(url).toContain('filePath=src%2Findex.ts');
      expect(url).toContain('authorModel=claude-sonnet-4');
      expect(url).toContain('authorFamily=anthropic');
      expect(init.method).toBe('GET');
      expect((init.headers as Record<string, string>)['X-API-Key']).toBe('test-key');
      expect((init.headers as Record<string, string>)['X-Client-Source']).toBe('sdk');
      expect(result).toEqual(body);
    });

    it('omits undefined query params', async () => {
      const fetch = mockFetch(200, { warnings: [], injectionText: null, meta: {} });
      const client = createClient(fetch);

      await client.getWarnings({ projectId: 'proj_1' });

      const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
      expect(url).toContain('projectId=proj_1');
      expect(url).not.toContain('filePath');
      expect(url).not.toContain('authorModel');
    });
  });

  describe('submitReview', () => {
    it('sends correct POST request with body', async () => {
      const responseBody = {
        findings: [{ severity: 'high', description: 'SQL injection risk' }],
        reviewerBot: 'atlas',
        reviewerModel: 'gpt-5',
        reviewerTier: 'flagship',
        reviewerFamily: 'openai',
        meta: {},
      };
      const fetch = mockFetch(200, responseBody);
      const client = createClient(fetch);

      const result = await client.submitReview({
        projectId: 'proj_1',
        diff: '+ console.log("hello")',
        filePath: 'src/app.ts',
        language: 'typescript',
        authorModel: 'claude-sonnet-4',
        authorFamily: 'anthropic',
      });

      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/v1/hivemind/review');
      expect(init.method).toBe('POST');
      expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
      expect(JSON.parse(init.body as string)).toEqual({
        projectId: 'proj_1',
        diff: '+ console.log("hello")',
        filePath: 'src/app.ts',
        language: 'typescript',
        authorModel: 'claude-sonnet-4',
        authorFamily: 'anthropic',
      });
      expect(result.findings).toHaveLength(1);
      expect(result.reviewerBot).toBe('atlas');
    });
  });

  describe('submitTrace', () => {
    it('sends trace with all fields', async () => {
      const fetch = mockFetch(200, { recorded: true, mistakesDetected: [], meta: {} });
      const client = createClient(fetch);

      await client.submitTrace({
        projectId: 'proj_1',
        tool: 'write_to_file',
        model: 'claude-sonnet-4',
        family: 'anthropic',
        tier: 'balanced',
        input: { path: 'foo.ts' },
        output: { success: true },
        success: true,
        duration: 150,
      });

      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(init.body as string);
      expect(body.tool).toBe('write_to_file');
      expect(body.duration).toBe(150);
      expect(body.success).toBe(true);
    });
  });

  describe('reportMistake', () => {
    it('returns mistakeId on 201', async () => {
      const fetch = mockFetch(201, { mistakeId: 'mk_abc123' });
      const client = createClient(fetch);

      const result = await client.reportMistake({
        projectId: 'proj_1',
        errorType: 'null_check',
        description: 'Missed null check on user.email',
        rootCause: 'Assumed user always has email',
        prevention: 'Add optional chaining',
        severity: 'medium',
        model: 'claude-sonnet-4',
        family: 'anthropic',
        tier: 'balanced',
      });

      expect(result.mistakeId).toBe('mk_abc123');
    });
  });

  describe('searchMemory', () => {
    it('sends query params for memory search', async () => {
      const fetch = mockFetch(200, { memories: [] });
      const client = createClient(fetch);

      await client.searchMemory({ projectId: 'proj_1', query: 'auth flow' });

      const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
      expect(url).toContain('projectId=proj_1');
      expect(url).toContain('query=auth+flow');
    });
  });

  describe('writeMemory', () => {
    it('sends memory with tags and relatedFiles', async () => {
      const fetch = mockFetch(201, { memoryId: 'mem_xyz' });
      const client = createClient(fetch);

      const result = await client.writeMemory({
        projectId: 'proj_1',
        content: 'Uses JWT for auth',
        type: 'decision',
        importance: 'important',
        tags: ['auth', 'jwt'],
        relatedFiles: ['src/auth.ts'],
      });

      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(init.body as string);
      expect(body.tags).toEqual(['auth', 'jwt']);
      expect(result.memoryId).toBe('mem_xyz');
    });
  });

  describe('getInsights', () => {
    it('works with no params', async () => {
      const fetch = mockFetch(200, { insights: { metric: 'review', recommendation: '', botStats: [] }, meta: {} });
      const client = createClient(fetch);

      await client.getInsights();

      const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
      expect(url).toContain('/v1/hivemind/insights');
    });
  });

  describe('error handling', () => {
    it('throws AuthError on 401', async () => {
      const fetch = mockFetch(401, { error: 'unauthorized' });
      const client = createClient(fetch);

      await expect(client.getWarnings({ projectId: 'p' })).rejects.toThrow(AuthError);
    });

    it('throws ValidationError on 400', async () => {
      const fetch = mockFetch(400, { error: 'validation_error', details: [] });
      const client = createClient(fetch);

      await expect(client.submitReview({} as never)).rejects.toThrow(ValidationError);
    });

    it('throws PayloadTooLargeError on 413', async () => {
      const fetch = mockFetch(413, { error: 'payload_too_large' });
      const client = createClient(fetch);

      await expect(client.submitReview({} as never)).rejects.toThrow(PayloadTooLargeError);
    });

    it('throws NotImplementedError on 501', async () => {
      const fetch = mockFetch(501, { error: 'not_implemented' });
      const client = createClient(fetch);

      await expect(client.setKey({ provider: 'openai', apiKey: 'sk-test123456' })).rejects.toThrow(NotImplementedError);
    });

    it('throws RateLimitError on 429 with retryAfterMs', async () => {
      const fetch = mockFetch(429, { error: 'rate_limited', retryAfterMs: 30000 });
      const client = createClient(fetch);

      try {
        await client.getWarnings({ projectId: 'p' });
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfterMs).toBe(30000);
      }
    });
  });

  describe('retry logic', () => {
    it('retries on 429 and succeeds', async () => {
      const fn = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          json: () => Promise.resolve({ error: 'rate_limited', retryAfterMs: 10 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ warnings: [], injectionText: null, meta: {} }),
        });

      const client = new HiveMind({
        apiKey: 'test-key',
        baseUrl: 'https://test.voltbots.com',
        fetch: fn as unknown as typeof globalThis.fetch,
        maxRetries: 2,
        retryBaseMs: 10,
      });

      const result = await client.getWarnings({ projectId: 'p' });
      expect(fn).toHaveBeenCalledTimes(2);
      expect(result.warnings).toEqual([]);
    });
  });
});
