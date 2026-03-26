export { HiveMind } from './client.js';
export { enhancePrompt } from './enhance.js';

export {
  HiveMindError,
  AuthError,
  ValidationError,
  RateLimitError,
  PayloadTooLargeError,
  NotImplementedError,
} from './errors.js';

export type {
  ProviderFamily,
  Severity,
  MemoryType,
  Importance,
  ClientSource,
  ReviewRequest,
  TraceRequest,
  MistakeRequest,
  MemoryWriteRequest,
  KeySetRequest,
  WarningsQuery,
  MemorySearchQuery,
  InsightsQuery,
  Warning,
  WarningsResponse,
  ReviewFinding,
  ReviewResponse,
  TraceResponse,
  MistakeResponse,
  Memory,
  MemorySearchResponse,
  MemoryWriteResponse,
  InsightsResponse,
  HiveMindOptions,
} from './types.js';
