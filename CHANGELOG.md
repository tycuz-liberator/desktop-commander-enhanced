# Changelog — desktop-commander-enhanced

## [Unreleased]

### Added
- Versioned tool substrate `dce.tool.v1`: ToolDefinition, ToolRegistry, CircuitBreaker.
- package.json + strict tsconfig (NodeNext, strict, noUnusedLocals).
- Entry exports in src/index.ts with DCE_IDENTITY.
- Bounded registry (maxTools), per-tool timeout + maxResultBytes, circuit breaker with capped keys.

### Changed
- PROGRESS.md now points next wake at first Batch A tool (get_system_overview).

## [0.1.0-substrate] — 2026-09-07
- First durable code beyond tracking files.
- Manual commit after automation runs failed to push.

## [0.0.0] — 2026-09-06
- Repo bootstrap under tycuz-liberator; tracking files only.
