/**
 * VoltBots Hivemind SDK — TypeScript Usage Examples
 *
 * npm install @voltbots/hivemind
 */

import { HiveMind, enhancePrompt } from '@voltbots/hivemind';

const hivemind = new HiveMind({
  apiKey: process.env.HIVEMIND_API_KEY!,
  // baseUrl: 'https://api.voltbots.com', // default
});

// ---------------------------------------------------------------------------
// 1. Get warnings before a task
// ---------------------------------------------------------------------------

const warnings = await hivemind.getWarnings({
  projectId: 'my-project',
  filePath: 'src/auth.ts',
  authorModel: 'claude-sonnet-4',
  authorFamily: 'anthropic',
});

console.log(`Found ${warnings.warnings.length} warnings`);

// Enhance a prompt with warnings
const enhanced = enhancePrompt('Implement JWT authentication', warnings);
console.log(enhanced);

// ---------------------------------------------------------------------------
// 2. Request cross-family code review
// ---------------------------------------------------------------------------

const review = await hivemind.submitReview({
  projectId: 'my-project',
  diff: `
+ function login(email: string, password: string) {
+   const user = db.findUser(email);
+   if (user.password === password) {
+     return createSession(user);
+   }
+ }
  `.trim(),
  filePath: 'src/auth.ts',
  language: 'typescript',
  authorModel: 'claude-sonnet-4',
  authorFamily: 'anthropic',
});

console.log(`Review by ${review.reviewerModel} (${review.reviewerFamily}):`);
for (const finding of review.findings) {
  console.log(`  [${finding.severity}] ${finding.description}`);
}

// ---------------------------------------------------------------------------
// 3. Report a mistake
// ---------------------------------------------------------------------------

const mistake = await hivemind.reportMistake({
  projectId: 'my-project',
  errorType: 'security',
  description: 'Compared passwords in plaintext instead of using bcrypt',
  rootCause: 'Forgot to hash password before comparison',
  prevention: 'Always use bcrypt.compare() for password verification',
  severity: 'critical',
  model: 'claude-sonnet-4',
  family: 'anthropic',
  tier: 'balanced',
  domain: 'auth',
});

console.log(`Mistake recorded: ${mistake.mistakeId}`);

// ---------------------------------------------------------------------------
// 4. Submit a tool trace
// ---------------------------------------------------------------------------

await hivemind.submitTrace({
  projectId: 'my-project',
  tool: 'write_to_file',
  model: 'claude-sonnet-4',
  family: 'anthropic',
  tier: 'balanced',
  input: { path: 'src/auth.ts', content: '...' },
  output: { success: true },
  success: true,
  duration: 150,
});

// ---------------------------------------------------------------------------
// 5. Project memory
// ---------------------------------------------------------------------------

// Write memory
await hivemind.writeMemory({
  projectId: 'my-project',
  content: 'This project uses bcrypt for password hashing and JWT for sessions',
  type: 'decision',
  importance: 'important',
  tags: ['auth', 'security'],
  relatedFiles: ['src/auth.ts', 'src/session.ts'],
});

// Search memory
const memories = await hivemind.searchMemory({
  projectId: 'my-project',
  query: 'password hashing',
});

for (const mem of memories.memories) {
  console.log(`[${mem.type}] ${mem.content}`);
}

// ---------------------------------------------------------------------------
// 6. Performance insights
// ---------------------------------------------------------------------------

const insights = await hivemind.getInsights({
  projectId: 'my-project',
  metric: 'review',
});

console.log(`Recommendation: ${insights.insights.recommendation}`);
