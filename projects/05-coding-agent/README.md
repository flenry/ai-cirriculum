# Project 05: Build a Minimal Coding Agent

**Phase:** 3 — AI Agents
**Difficulty:** ⭐⭐⭐⭐ Advanced
**Duration:** 1-2 weeks

---

## 🎯 Objective

Build a coding agent from scratch — an LLM that can read files, write code, run commands, observe outputs, and iterate until a task is complete. This demystifies tools like Claude Code, Cursor, and Devin. You'll understand exactly what's happening under the hood.

---

## 📋 Outcomes

By completing this project you will be able to:

- [ ] Implement an agent loop: prompt → tool call → execute → observe → repeat
- [ ] Design a tool interface for file system operations (read, write, edit, list)
- [ ] Implement safe command execution with sandboxing (timeouts, restricted paths)
- [ ] Handle multi-step coding tasks (write code → run tests → fix errors → re-run)
- [ ] Manage context window efficiently (don't dump entire files when a snippet suffices)
- [ ] Understand why coding agents fail and how to make them more reliable

---

## 🏗 Spec

### Tools the Agent Gets

| Tool | Description | Parameters |
|------|-------------|------------|
| `read_file(path)` | Read file contents | path, optional: line_start, line_end |
| `write_file(path, content)` | Create or overwrite a file | path, content |
| `edit_file(path, old, new)` | Replace exact text in a file | path, old_text, new_text |
| `list_files(dir)` | List files in a directory | directory path, optional: recursive |
| `run_command(cmd)` | Execute a shell command | command string, timeout |
| `search_files(pattern, dir)` | Grep/search across files | regex pattern, directory |

### Agent Loop
```
1. User gives a task ("Add input validation to the signup form")
2. Agent thinks about what to do (planning step)
3. Agent calls tools (read files to understand codebase)
4. Agent writes/edits code
5. Agent runs tests or the app
6. If errors → agent reads error output → fixes → re-runs (max 5 retries)
7. Agent reports completion with summary of changes
```

### Safety
- **Sandboxed directory** — Agent can only read/write within the project folder
- **Command allowlist** — Only approved commands (npm test, python, cat, ls, etc.)
- **Timeout** — Commands killed after 30 seconds
- **Confirmation** — Optionally require human approval before writes (human-in-the-loop mode)

### Test Scenarios
1. **Simple:** "Create a Python function that checks if a string is a palindrome, with tests"
2. **Medium:** "Read this Express app and add input validation to the POST /users endpoint"
3. **Hard:** "This test suite has 3 failing tests. Fix the code to make them pass"
4. **Multi-file:** "Refactor this module to split it into separate files, update all imports"

---

## 🧪 Evaluation Criteria

| Criteria | What "good" looks like |
|----------|----------------------|
| **Autonomy** | Agent completes tasks with minimal human intervention |
| **Safety** | Cannot escape sandbox, respects timeouts, no destructive operations |
| **Efficiency** | Reads only what it needs, doesn't rewrite entire files for small changes |
| **Error recovery** | Reads error messages, makes targeted fixes, doesn't loop forever |
| **Code quality** | Generated code is clean, idiomatic, and tested |

---

## 💡 Tips

- The `edit_file` tool is the hardest to get right — exact string matching is tricky. Consider fuzzy matching as a fallback
- Start with just `read_file` + `write_file` + `run_command`. Add `edit_file` and `search_files` once the basics work
- The planning step matters more than you think. Without it, agents jump into code changes without understanding the codebase
- Token management is critical — a 100-file project can't fit in context. The agent must be selective about what it reads
- Compare your agent's behavior to Claude Code or pi — notice what they do that you didn't think of
