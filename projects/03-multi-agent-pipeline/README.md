# Project 03: Multi-Agent Content Pipeline

**Phase:** 3 — AI Agents (Orchestration)
**Difficulty:** ⭐⭐⭐⭐ Advanced
**Duration:** 2 weeks

---

## 🎯 Objective

Build a multi-agent system where specialized agents collaborate through an orchestrator to produce high-quality content. This is the project that teaches you how real AI-first companies structure their agent workflows.

The pipeline: **Researcher → Writer → Editor → Fact-Checker → Publisher**

---

## 📋 Outcomes

By completing this project you will be able to:

- [ ] Design and implement 4 orchestration patterns: pipeline, fan-out/fan-in, supervisor, debate
- [ ] Build specialized agents with distinct system prompts, tools, and evaluation criteria
- [ ] Implement agent-to-agent communication via structured message passing
- [ ] Handle failures, retries, and human-in-the-loop checkpoints
- [ ] Build an orchestrator that manages state, routing, and termination
- [ ] Understand the tradeoffs between tight coupling (pipeline) and loose coupling (supervisor)

---

## 🏗 Spec

### The Agents

| Agent | Role | Tools | Output |
|-------|------|-------|--------|
| **Orchestrator** | Manages the pipeline, routes work, handles errors | dispatch, check_status, escalate | Task assignments, status updates |
| **Researcher** | Gathers information on a topic | web_search, read_page, save_notes | Research brief (structured notes + sources) |
| **Writer** | Produces a draft from the research brief | read_brief, write_draft | Article draft (markdown) |
| **Editor** | Reviews for clarity, tone, structure, grammar | read_draft, suggest_edits, rewrite_section | Edited draft + change log |
| **Fact-Checker** | Verifies claims against sources | read_draft, web_search, verify_claim | Fact-check report (claim → verdict → source) |

### Pipeline Flow
```
User Input (topic + requirements)
    ↓
Orchestrator assigns to Researcher
    ↓
Researcher produces research brief
    ↓
Orchestrator assigns to Writer
    ↓
Writer produces draft
    ↓
Orchestrator fans out to Editor + Fact-Checker (parallel)
    ↓
Orchestrator collects results
    ↓
If issues found → route back to Writer with feedback (max 2 revision loops)
    ↓
Final output published
```

### Orchestration Patterns to Implement
1. **Pipeline** (sequential) — The main flow above
2. **Fan-out/Fan-in** — Editor + Fact-Checker run in parallel
3. **Revision loop** — Writer revises based on feedback (supervisor pattern)
4. **Debate (bonus)** — Two Writer agents produce competing drafts, Editor picks the best

### State Management
- Each agent run produces a typed artifact (research brief, draft, edit report, fact-check report)
- Orchestrator maintains a task graph with status per node
- Full trace log of every agent action for debugging

---

## 🧪 Evaluation Criteria

| Criteria | What "good" looks like |
|----------|----------------------|
| **Architecture** | Clean separation between orchestrator and agents, typed interfaces |
| **Reliability** | Handles agent failures, retries, and timeouts gracefully |
| **Quality** | Final output is genuinely better than a single-agent approach |
| **Observability** | Can trace any decision back through the full agent chain |
| **Documentation** | Architecture diagram, README, and a writeup of design decisions |

---

## 💡 Tips

- Build one agent at a time. Get Researcher working alone before wiring up the pipeline
- Use structured outputs (JSON schemas) for agent-to-agent communication — not free-form text
- The orchestrator is the hardest part. Keep it simple: a state machine, not a god-agent
- Log EVERYTHING. When something goes wrong (and it will), logs are your only debugger
- Compare the output quality: single-agent vs pipeline. If the pipeline isn't better, something is wrong
- This is a portfolio centerpiece — write it up as a blog post or include an architecture diagram
