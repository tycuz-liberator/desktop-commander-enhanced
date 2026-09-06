/**
 * desktop-commander-enhanced entry.
 * Environment-agnostic core; OS differences only via config/adapters later.
 */

export { TOOL_SCHEMA_VERSION } from "./types/tool.js";
export type {
  ToolDefinition,
  ToolHandler,
  ToolResult,
  ToolInvocationContext,
  RegisteredTool,
} from "./types/tool.js";
export { ToolRegistry } from "./core/registry.js";
export { CircuitBreaker } from "./core/circuit-breaker.js";
export type { CircuitState } from "./core/circuit-breaker.js";

/** Schema / package identity for agents and observability. */
export const DCE_IDENTITY = {
  name: "desktop-commander-enhanced",
  schemaVersion: "dce.tool.v1",
  baselineUpstreamTools: 26,
  targetNewTools: 25,
} as const;
