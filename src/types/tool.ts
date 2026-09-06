/**
 * Versioned tool interface for desktop-commander-enhanced.
 * Schema version: dce.tool.v1
 *
 * Constraints enforced at registration and invocation:
 * - explicit timeoutMs
 * - bounded result size
 * - no global mutable state in handlers
 * - deterministic error surfaces
 */

export const TOOL_SCHEMA_VERSION = "dce.tool.v1" as const;

export type ToolSchemaVersion = typeof TOOL_SCHEMA_VERSION;

export interface ToolInputSchema {
  readonly type: "object";
  readonly properties: Record<string, unknown>;
  readonly required?: readonly string[];
  readonly additionalProperties?: boolean;
}

export interface ToolDefinition {
  readonly name: string;
  readonly schemaVersion: ToolSchemaVersion;
  readonly description: string;
  readonly inputSchema: ToolInputSchema;
  /** Hard timeout for the tool invocation (ms). Required. */
  readonly timeoutMs: number;
  /** Max serialized result bytes. Required. */
  readonly maxResultBytes: number;
  /** Optional circuit-breaker key; failures trip shared breaker. */
  readonly circuitBreakerKey?: string;
  /** Idempotency notes for operators / agents. */
  readonly idempotency: string;
}

export type ToolHandler = (
  args: Record<string, unknown>,
  ctx: ToolInvocationContext
) => Promise<ToolResult>;

export interface ToolInvocationContext {
  readonly invocationId: string;
  readonly startedAt: number;
  readonly signal: AbortSignal;
}

export type ToolResult =
  | { readonly ok: true; readonly data: unknown }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: string;
        readonly message: string;
        readonly retryable: boolean;
      };
    };

export interface RegisteredTool extends ToolDefinition {
  readonly handler: ToolHandler;
}
