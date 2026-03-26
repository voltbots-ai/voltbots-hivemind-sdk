import { describe, it, expect } from 'vitest';
import { enhancePrompt } from '../src/enhance.js';
import type { WarningsResponse } from '../src/types.js';

describe('enhancePrompt', () => {
  it('prepends injection text when present', () => {
    const warnings: WarningsResponse = {
      warnings: [
        {
          type: 'null_check',
          pattern: 'Often misses null checks',
          severity: 'high',
          prevention: 'Use optional chaining',
          rootCause: 'Assumed non-null',
        },
      ],
      injectionText: 'KNOWN ISSUES IN THIS PROJECT:\n- [high] Often misses null checks',
      meta: {},
    };

    const result = enhancePrompt('Write a login function', warnings);

    expect(result).toContain('KNOWN ISSUES IN THIS PROJECT');
    expect(result).toContain('Write a login function');
    expect(result.indexOf('KNOWN ISSUES')).toBeLessThan(result.indexOf('Write a login'));
  });

  it('returns prompt unchanged when injectionText is null', () => {
    const warnings: WarningsResponse = {
      warnings: [],
      injectionText: null,
      meta: {},
    };

    const result = enhancePrompt('Write a login function', warnings);
    expect(result).toBe('Write a login function');
  });
});
