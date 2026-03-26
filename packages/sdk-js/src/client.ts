import {
  AuthError,
  HiveMindError,
  NotImplementedError,
  PayloadTooLargeError,
  RateLimitError,
  ValidationError,
} from './errors.js';
import type {
  ClientSource,
  HiveMindOptions,
  InsightsQuery,
  InsightsResponse,
  KeySetRequest,
  MemorySearchQuery,
  MemorySearchResponse,
  MemoryWriteRequest,
  MemoryWriteResponse,
  MistakeRequest,
  MistakeResponse,
  ReviewRequest,
  ReviewResponse,
  TraceRequest,
  TraceResponse,
  WarningsQuery,
  WarningsResponse,
} from './types.js';

const SDK_VERSION = '0.1.0';
const DEFAULT_BASE_URL = 'https://api.voltbots.com';
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_BASE_MS = 1_000;

interface RequestOptions {
  query?: Record<string, string | undefined>;
  body?: unknown;
}

export class HiveMind {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly source: ClientSource;
  private readonly version: string;
  private readonly maxRetries: number;
  private readonly retryBaseMs: number;
  private readonly timeout: number;
  private readonly _fetch: typeof globalThis.fetch;

  constructor(options: HiveMindOptions) {
    if (!options.apiKey) {
      throw new Error('apiKey is required');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.source = options.source ?? 'sdk';
    this.version = options.version ?? SDK_VERSION;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryBaseMs = options.retryBaseMs ?? DEFAULT_RETRY_BASE_MS;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this._fetch = options.fetch ?? globalThis.fetch;
  }

  // ---------------------------------------------------------------------------
  // Core request method
  // ---------------------------------------------------------------------------

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    opts?: RequestOptions,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (opts?.query) {
      for (const [key, value] of Object.entries(opts.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, value);
        }
      }
    }

    const headers: Record<string, string> = {
      'X-API-Key': this.apiKey,
      'X-Client-Source': this.source,
      'X-Client-Version': this.version,
    };

    if (opts?.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await this._fetch(url.toString(), {
          method,
          headers,
          body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (response.ok) {
          // 201/202 may have body, 204 won't
          if (response.status === 204) return undefined as T;
          return (await response.json()) as T;
        }

        let body: unknown;
        try {
          body = await response.json();
        } catch {
          body = { error: 'unknown', message: response.statusText };
        }

        // Retryable: 429
        if (response.status === 429) {
          const err = new RateLimitError(body);
          lastError = err;

          if (attempt < this.maxRetries) {
            const backoff = Math.min(
              err.retryAfterMs,
              this.retryBaseMs * Math.pow(2, attempt),
            );
            await sleep(backoff);
            continue;
          }
          throw err;
        }

        // Non-retryable errors
        switch (response.status) {
          case 400:
            throw new ValidationError(body);
          case 401:
            throw new AuthError(body);
          case 413:
            throw new PayloadTooLargeError(body);
          case 501:
            throw new NotImplementedError(body);
          default:
            throw new HiveMindError(
              `HTTP ${response.status}`,
              response.status,
              typeof body === 'object' && body !== null && 'error' in body
                ? String((body as Record<string, unknown>).error)
                : 'unknown',
              body,
            );
        }
      } catch (err) {
        clearTimeout(timer);

        // Re-throw SDK errors directly
        if (err instanceof HiveMindError) throw err;

        // Abort = timeout
        if (err instanceof DOMException && err.name === 'AbortError') {
          lastError = new HiveMindError('Request timed out', 0, 'timeout', null);
          if (attempt >= this.maxRetries) throw lastError;
          await sleep(this.retryBaseMs * Math.pow(2, attempt));
          continue;
        }

        // Network errors are retryable
        lastError = err;
        if (attempt >= this.maxRetries) {
          throw new HiveMindError(
            err instanceof Error ? err.message : 'Network error',
            0,
            'network_error',
            null,
          );
        }
        await sleep(this.retryBaseMs * Math.pow(2, attempt));
      }
    }

    throw lastError;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  async getWarnings(params: WarningsQuery): Promise<WarningsResponse> {
    return this.request<WarningsResponse>('GET', '/v1/hivemind/warnings', {
      query: {
        projectId: params.projectId,
        filePath: params.filePath,
        domain: params.domain,
        authorModel: params.authorModel,
        authorFamily: params.authorFamily,
      },
    });
  }

  async submitReview(body: ReviewRequest): Promise<ReviewResponse> {
    return this.request<ReviewResponse>('POST', '/v1/hivemind/review', { body });
  }

  async submitTrace(body: TraceRequest): Promise<TraceResponse> {
    return this.request<TraceResponse>('POST', '/v1/hivemind/trace', { body });
  }

  async reportMistake(body: MistakeRequest): Promise<MistakeResponse> {
    return this.request<MistakeResponse>('POST', '/v1/hivemind/mistake', { body });
  }

  async searchMemory(params: MemorySearchQuery): Promise<MemorySearchResponse> {
    return this.request<MemorySearchResponse>('GET', '/v1/hivemind/memory', {
      query: {
        projectId: params.projectId,
        query: params.query,
      },
    });
  }

  async writeMemory(body: MemoryWriteRequest): Promise<MemoryWriteResponse> {
    return this.request<MemoryWriteResponse>('POST', '/v1/hivemind/memory', { body });
  }

  async getInsights(params?: InsightsQuery): Promise<InsightsResponse> {
    return this.request<InsightsResponse>('GET', '/v1/hivemind/insights', {
      query: {
        projectId: params?.projectId,
        botName: params?.botName,
        metric: params?.metric,
      },
    });
  }

  async setKey(body: KeySetRequest): Promise<void> {
    await this.request<void>('POST', '/v1/hivemind/keys', { body });
  }

  async listKeys(): Promise<unknown> {
    return this.request<unknown>('GET', '/v1/hivemind/keys');
  }

  async revokeKey(provider: string): Promise<void> {
    await this.request<void>('DELETE', `/v1/hivemind/keys`, {
      query: { provider },
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
