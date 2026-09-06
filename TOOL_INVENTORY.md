# Tool Inventory — desktop-commander-enhanced

## Baseline (original Desktop Commander MCP ≈ 26 tools)
Config: get_config, set_config_value
Filesystem: read_file, read_multiple_files, write_file, write_pdf, create_directory, list_directory, get_file_info, move_file
Edit: edit_block
Terminal/Process: start_process, interact_with_process, read_process_output, list_sessions, list_processes, kill_process, force_terminate
Search: start_search, get_more_search_results, stop_search, list_searches
Meta: get_recent_tool_calls, get_usage_stats, get_prompts, give_feedback_to_desktop_commander

## New tools (dce.tool.v1) — implemented
| Name | Status | timeoutMs | maxResultBytes | circuitBreakerKey |
|------|--------|-----------|----------------|-------------------|
| get_system_overview | done | 10000 | 32768 | system.overview |
| get_cpu_per_core | done | 10000 | 65536 | system.cpu_per_core |

## Target remaining (Batch A–F)
### Batch A — System Observability
3. get_top_consumers
4. get_network_stats
5. get_disk_usage (path + depth bounded)
6. get_battery_status
7. list_listening_ports / get_port_owner

### Batch B — Process Control Hardening
8. set_process_limits
9. get_process_tree (depth bounded)
10. wait_for_process (deadline)

### Batch C — Desktop / Human Interface
11–15. clipboard, notification, display, screenshot

### Batch D — Agent Orchestration & Safety
16–20. resource budget, state snapshot, audit query, circuit status, sandboxed code

### Batch E — Config / Updates / Integrity
21–24. config history/rollback, TUF update check, key rotation

### Batch F
25. watch_path (bounded)

Every new tool MUST ship with: versioned schema, explicit timeout, bounded memory/result size, limited retries + circuit breaker, idempotency notes, explicit error surface, hierarchical observability hook, environment-agnostic implementation.
