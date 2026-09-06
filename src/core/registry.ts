/**
 * Versioned tool registry — dce.tool.v1
 * Bounded registration, timeout-enforced invocation, circuit breaker integration.
 * No module-level mutable singleton; callers own the instance.
 */

import {
  TOOL_SCHEMA_VERSION,
  type RegisteredTool,
  type ToolDefinition,
  type ToolHandler,
  type ToolResult,
  type ToolInvocationContext,
} from "../types/tool.js";
import { CircuitBreaker } from "./circuit-breaker.js";

export interface RegistryOptions {
  readonly maxTools: number;
  readonly defaultTimeoutMs: number;
  readonly defaultMaxResultBytes: number;
}

const REG_DEFAULTS: RegistryOptions = {
  maxTools: 128,
  defaultTimeoutMs: 30_000,
  defaultMaxResultBytes: 512_000,
};

export class ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();
  private readonly breaker: CircuitBreaker;
  private readonly opts: RegistryOptions;

  constructor(opts?: Partial<RegistryOptions>, breaker?: CircuitBreaker) {
    this.opts = { ...REG_DEFAULTS, ...opts };
    this.breaker = breaker ?? new CircuitBreaker();
  }

  register(def: ToolDefinition, handler: ToolHandler): void {
    if (def.schemaVersion !== TOOL_SCHEMA_VERSION) {
      throw new Error(
        `Unsupported schemaVersion ${def.schemaVersion}; required ${TOOL_SCHEMA_VERSION}`
      );
    }
    if (def.timeoutMs <= 0 || def.maxResultBytes <= 0) {
      throw new Error("timeoutMs and maxResultBytes must be positive");
    }
    if (this.tools.size >= this.opts.maxTools && !this.tools.has(def.name)) {
      throw new Error(`Registry full (maxTools=${this.opts.maxTools})`);
    }
    this.tools.set(def.name, { ...def, handler });
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): readonly ToolDefinition[] {
    return [...this.tools.values()].map(
      ({ handler: _h, ...def }) => def
    );
  }

  async invoke(
    name: string,
    args: Record<string, unknown>,
    invocationId: string
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        ok: false,
        error: {
          code: "TOOL_NOT_FOUND",
          message: `Unknown tool: ${name}`,
          retryable: false,
        },
      };
    }

    const cbKey = tool.circuitBreakerKey ?? tool.name;
    if (!this.breaker.canExecute(cbKey)) {
      return {
        ok: false,
        error: {
          code: "CIRCUIT_OPEN",
          message: `Circuit open for ${cbKey}`,
          retryable: true,
        },
      };
    }
    this.breaker.noteHalfOpenCall(cbKey);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), tool.timeoutMs);
    const ctx: ToolInvocationContext = {
      invocationId,
      startedAt: Date.now(),
      signal: controller.signal,
    };

    try {
      const result = await tool.handler(args, ctx);
      if (result.ok) {
        const size = roughSize(result.data);
        if (size > tool.maxResultBytes) {
          this.breaker.recordFailure(cbKey);
          return {
            ok: false,
            error: {
              code: "RESULT_TOO_LARGE",
              message: `Result ${size}b exceeds maxResultBytes ${tool.maxResultBytes}`,
              retryable: false,
            },
          };
        }
        this.breaker.recordSuccess(cbKey);
      } else if (result.error.retryable) {
        this.breaker.recordFailure(cbKey);
      }
      return result;
    } catch (err) {
      this.breaker.recordFailure(cbKey);
      const aborted = controller.signal.aborted;
      return {
        ok: false,
        error: {
          code: aborted ? "TIMEOUT" : "HANDLER_THREW",
          message: aborted
            ? `Tool ${name} timed out after ${tool.timeoutMs}ms`
            : err instanceof Error
              ? err.message
              : String(err),
          retryable: aborted,
        },
      };
    } finally {
      clearTimeout(timer);
    }
  }

  circuitSnapshot(limit = 32) {
    return this.breaker.snapshot(limit);
  }
}

function roughSize(data: unknown): number {
  try {
    return JSON.stringify(data)?.length ?? 0;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}
