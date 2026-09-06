/**
 * Registers Batch A observability tools onto a caller-owned ToolRegistry.
 */

import type { ToolRegistry } from "../core/registry.js";
import {
  GET_SYSTEM_OVERVIEW_DEF,
  getSystemOverviewHandler,
  GET_CPU_PER_CORE_DEF,
  getCpuPerCoreHandler,
} from "./system-overview.js";

export function registerBatchAObservability(registry: ToolRegistry): void {
  registry.register(GET_SYSTEM_OVERVIEW_DEF, getSystemOverviewHandler);
  registry.register(GET_CPU_PER_CORE_DEF, getCpuPerCoreHandler);
}

export const BATCH_A_TOOL_NAMES = [
  "get_system_overview",
  "get_cpu_per_core",
] as const;
