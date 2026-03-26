export class HiveMindError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode: string,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'HiveMindError';
  }
}

export class AuthError extends HiveMindError {
  constructor(body: unknown) {
    super('Unauthorized — invalid or missing API key', 401, 'unauthorized', body);
    this.name = 'AuthError';
  }
}

export class ValidationError extends HiveMindError {
  constructor(body: unknown) {
    super('Validation failed', 400, 'validation_error', body);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends HiveMindError {
  public readonly retryAfterMs: number;

  constructor(body: unknown) {
    super('Rate limit exceeded', 429, 'rate_limited', body);
    this.name = 'RateLimitError';
    this.retryAfterMs =
      typeof body === 'object' && body !== null && 'retryAfterMs' in body
        ? (body as { retryAfterMs: number }).retryAfterMs
        : 60_000;
  }
}

export class PayloadTooLargeError extends HiveMindError {
  constructor(body: unknown) {
    super('Payload too large (max 1 MB)', 413, 'payload_too_large', body);
    this.name = 'PayloadTooLargeError';
  }
}

export class NotImplementedError extends HiveMindError {
  constructor(body: unknown) {
    super('Endpoint not yet implemented', 501, 'not_implemented', body);
    this.name = 'NotImplementedError';
  }
}
