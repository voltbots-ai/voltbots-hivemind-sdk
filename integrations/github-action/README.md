# VoltBots Hivemind — GitHub Action

Automatic cross-family code review on pull requests.

## Usage

```yaml
name: Hivemind Review

on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Hivemind Code Review
        uses: voltbots/hivemind-action@v1
        with:
          api-key: ${{ secrets.HIVEMIND_API_KEY }}
          project-id: ${{ github.repository }}
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-key` | Yes | — | Hivemind API key |
| `project-id` | No | `${{ github.repository }}` | Project identifier |
| `fail-on-critical` | No | `false` | Fail the check on critical findings |

## What It Does

1. Extracts the PR diff
2. Sends each changed file for cross-family review via `submitReview()`
3. Posts findings as PR review comments
4. Optionally fails the check on critical severity findings

## Status

This action is planned. The SDK and MCP server are available now for manual integration.

## License

Apache-2.0
