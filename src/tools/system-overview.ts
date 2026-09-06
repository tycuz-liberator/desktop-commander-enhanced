/**
 * Batch A — get_system_overview + get_cpu_per_core
 * Schema: dce.tool.v1
 * Environment-agnostic core using node:os only (no shell).
 * Bounds: timeouts, maxResultBytes, circuit breaker keys.
 */

import * as os from "node:os";
import type {
  ToolDefinition,
  ToolHandler,
  ToolResult,
} from "../types/tool.js";
import { TOOL_SCHEMA_VERSION } from "../types/tool.js";

export const GET_SYSTEM_OVERVIEW_DEF: ToolDefinition = {
  name: "get_system_overview",
  schemaVersion: TOOL_SCHEMA_VERSION,
  description:
    "Bounded system overview: CPU load averages, memory, uptime, platform identity. No unbounded process lists.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  timeoutMs: 10_000,
  maxResultBytes: 32_768,
  circuitBreakerKey: "system.overview",
  idempotency:
    "Read-only snapshot; safe to retry. Values are point-in-time and may differ between calls.",
};

export const getSystemOverviewHandler: ToolHandler = async (
  _args,
  ctx
): Promise<ToolResult> => {
  if (ctx.signal.aborted) {
    return {
      ok: false,
      error: { code: "ABORTED", message: "Aborted before start", retryable: true },
    };
  }
  try {
    const cpus = os.cpus();
    const total = os.totalmem();
    const free = os.freemem();
    const load = os.loadavg() as [number, number, number];
    return {
      ok: true,
      data: {
        schemaVersion: "dce.system_overview.v1",
        capturedAt: new Date().toISOString(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        uptimeSec: Math.floor(os.uptime()),
        cpu: {
          count: cpus.length,
          model: cpus[0]?.model?.slice(0, 120) ?? "unknown",
          loadAvg: load,
        },
        memory: {
          totalBytes: total,
          freeBytes: free,
          usedBytes: total - free,
        },
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: {
        code: "OVERVIEW_FAILED",
        message: err instanceof Error ? err.message : String(err),
        retryable: true,
      },
    };
  }
};

export const GET_CPU_PER_CORE_DEF: ToolDefinition = {
  name: "get_cpu_per_core",
  schemaVersion: TOOL_SCHEMA_VERSION,
  description:
    "Per-logical-CPU model, speedMHz, and times (user/nice/sys/idle/irq). Bounded to os.cpus().length.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  timeoutMs: 10_000,
  maxResultBytes: 65_536,
  circuitBreakerKey: "system.cpu_per_core",
  idempotency: "Read-only snapshot; safe to retry.",
};

export const getCpuPerCoreHandler: ToolHandler = async (
  _args,
  ctx
): Promise<ToolResult> => {
  if (ctx.signal.aborted) {
    return {
      ok: false,
      error: { code: "ABORTED", message: "Aborted before start", retryable: true },
    };
  }
  try {
    const cores = os.cpus().map((c, index) => ({
      index,
      model: c.model.slice(0, 120),
      speedMHz: c.speed,
      times: {
        user: c.times.user,
        nice: c.times.nice,
        sys: c.times.sys,
        idle: c.times.idle,
        irq: c.times.irq,
      },
    }));
    return {
      ok: true,
      data: {
        schemaVersion: "dce.cpu_per_core.v1",
        capturedAt: new Date().toISOString(),
        cores,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: {
        code: "CPU_PER_CORE_FAILED",
        message: err instanceof Error ? err.message : String(err),
        retryable: true,
      },
    };
  }
};
