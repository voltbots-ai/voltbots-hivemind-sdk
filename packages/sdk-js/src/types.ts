// ---------------------------------------------------------------------------
// Enums / Unions
// ---------------------------------------------------------------------------

export type ProviderFamily = 'openai' | 'anthropic' | 'google' | 'xai' | 'volt';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type MemoryType =
  | 'decision'
  | 'error'
  | 'preference'
  | 'context'
  | 'environment'
  | 'user_style';

export type Importance = 'critical' | 'important' | 'notable';

export type ClientSource = 'claude-code' | 'codex' | 'sdk' | 'unknown';

// ---------------------------------------------------------------------------
// Request Bodies (POST endpoints)
// ---------------------------------------------------------------------------

export interface ReviewRequest {
  projectId: string;
  diff: string;
  filePath: string;
  language: string;
  authorModel: string;
  authorFamily: ProviderFamily;
  context?: string;
}

export interface TraceRequest {
  projectId: string;
  tool: string;
  model: string;
  family: ProviderFamily;
  tier: string;
  input: unknown;
  output: unknown;
  success: boolean;
  duration: number;
  error?: string;
}

export interface MistakeRequest {
  projectId: string;
  errorType: string;
  description: string;
  rootCause: string;
  prevention: string;
  severity: Severity;
  model: string;
  family: ProviderFamily;
  tier: string;
  domain?: string;
}

export interface MemoryWriteRequest {
  projectId: string;
  content: string;
  type: MemoryType;
  importance?: Importance;
  tags?: string[];
  relatedFiles?: string[];
}

export interface KeySetRequest {
  provider: Exclude<ProviderFamily, 'volt'>;
  apiKey: string;
}

// ---------------------------------------------------------------------------
// Query Params (GET endpoints)
// ---------------------------------------------------------------------------

export interface WarningsQuery {
  projectId: string;
  filePath?: string;
  domain?: string;
  authorModel?: string;
  authorFamily?: ProviderFamily;
}

export interface MemorySearchQuery {
  projectId: string;
  query: string;
}

export interface InsightsQuery {
  projectId?: string;
  botName?: string;
  metric?: string;
}

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

export interface Warning {
  type: string;
  pattern: string;
  severity: Severity;
  prevention: string | null;
  rootCause: string | null;
  source: 'project' | 'knowledge';
  bot: string | null;
}

export interface WarningsResponse {
  warnings: Warning[];
  injectionText: string | null;
  meta: Record<string, unknown>;
}

export interface ReviewFinding {
  severity: string;
  description: string;
  line?: number;
  suggestion?: string;
}

export interface ReviewResponse {
  findings: ReviewFinding[];
  reviewerBot: string;
  reviewerModel: string;
  reviewerTier: string;
  reviewerFamily: ProviderFamily;
  meta: Record<string, unknown>;
}

export interface TraceResponse {
  recorded: boolean;
  mistakesDetected: Array<{ errorType: string; description: string }>;
  warning?: string;
  meta: Record<string, unknown>;
}

export interface MistakeResponse {
  mistakeId: string;
}

export interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  importance: Importance;
  tags: string[];
  relatedFiles: string[];
  createdAt: string;
}

export interface MemorySearchResponse {
  memories: Memory[];
}

export interface MemoryWriteResponse {
  memoryId: string;
}

export interface InsightsResponse {
  insights: {
    metric: string;
    recommendation: string;
    botStats: Array<Record<string, unknown>>;
  };
  meta: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Client Options
// ---------------------------------------------------------------------------

export interface HiveMindOptions {
  apiKey: string;
  baseUrl?: string;
  source?: ClientSource;
  version?: string;
  maxRetries?: number;
  retryBaseMs?: number;
  timeout?: number;
  fetch?: typeof globalThis.fetch;
}
