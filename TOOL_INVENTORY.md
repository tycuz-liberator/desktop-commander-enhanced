# Tool Inventory — desktop-commander-enhanced

## Baseline (original Desktop Commander MCP ≈ 26 tools)
Config: get_config, set_config_value
Filesystem: read_file, read_multiple_files, write_file, write_pdf, create_directory, list_directory, get_file_info, move_file
Edit: edit_block
Terminal/Process: start_process, interact_with_process, read_process_output, list_sessions, list_processes, kill_process, force_terminate
Search: start_search, get_more_search_results, stop_search, list_searches
Meta: get_recent_tool_calls, get_usage_stats, get_prompts, give_feedback_to_desktop_commander

## Target +25 New Tools (production requirements mandatory)
Every new tool MUST ship with: versioned schema, explicit timeout, bounded memory/result size, limited retries + circuit breaker, idempotency notes, explicit error surface, hierarchical observability hook, environment-agnostic implementation.

### Batch A — System Observability (priority 1)
1. get_system_overview
2. get_cpu_per_core
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
11. read_clipboard
12. write_clipboard
13. send_notification
14. get_display_info
15. capture_screenshot (size-bounded)

### Batch D — Agent Orchestration & Safety
16. create_resource_budget / check_budget
17. snapshot_state / restore_state
18. query_audit_trail
19. get_circuit_breaker_status
20. run_sandboxed_code

### Batch E — Config / Updates / Integrity
21. config_version_history
22. rollback_config
23. check_for_updates_tuf
24. rotate_keys

### Batch F — Filesystem / Search Enhancements
25. watch_path (bounded event stream + timeout)

## Implementation Status
- Baseline: mapped
- New tools: 0 implemented
- Next: Batch A after scaffold
