# desktop-commander-enhanced

Personal production-grade extension of [DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) (MIT).

**Owner**: tycuz-liberator  
**Isolation**: Completely separate from chronarch. Never mix.

## Engineering bar (non-negotiable)
Deterministic · bounded resources · timeouts + limited retries + circuit breakers on all I/O · idempotent where possible · versioned interfaces & schemas · no global mutable state · explicit errors · horizontal scalability design · hierarchical observability · environment-agnostic core · crypto/TUF where remote or self-update appears.

No prototype-grade code will be accepted.

## Status
See `PROGRESS.md`, `CHANGELOG.md`, `TOOL_INVENTORY.md`.

Baseline ≈ 26 tools from upstream. Target +25 high-value tools that make agents dramatically more capable while staying production-safe.

## Attribution
Original work © Eduard Ruzga / Desktop Commander contributors, MIT License.  
This enhanced tree preserves attribution and license compliance.
