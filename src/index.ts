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
export {
  GET_SYSTEM_OVERVIEW_DEF,
  getSystemOverviewHandler,
  GET_CPU_PER_CORE_DEF,
  getCpuPerCoreHandler,
} from "./tools/system-overview.js";
export {
  registerBatchAObservability,
  BATCH_A_TOOL_NAMES,
} from "./tools/register-batch-a.js";

/** Schema / package identity for agents and observability. */
export const DCE_IDENTITY = {
  name: "desktop-commander-enhanced",
  schemaVersion: "dce.tool.v1",
  baselineUpstreamTools: 26,
  targetNewTools: 25,
  implementedNewTools: 2,
} as const;
