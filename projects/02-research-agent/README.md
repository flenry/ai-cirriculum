# Project 02: Research Agent

**Phase:** 3 — AI Agents
**Difficulty:** ⭐⭐⭐ Intermediate
**Duration:** 1 week

---

## 🎯 Objective

Build an autonomous research agent that can take a topic, search the web, read and extract information from multiple sources, synthesize findings, and produce a structured research report — with citations.

This teaches the core agent loop: **Think → Act → Observe → Repeat**.

---

## 📋 Outcomes

By completing this project you will be able to:

- [ ] Implement the ReAct (Reason + Act) pattern from scratch
- [ ] Give an LLM tools (web search, page reader, note-taking) and let it decide when to use them
- [ ] Manage an agent loop with termination conditions (max steps, confidence threshold, user stop)
- [ ] Handle tool errors gracefully (broken links, rate limits, timeouts)
- [ ] Produce structured, cited output from unstructured web data
- [ ] Understand token budget management in long-running agent tasks

---

## 🏗 Spec

### Tools the Agent Gets
1. **web_search(query)** — Search the web (via Brave Search API, SerpAPI, or Tavily)
2. **read_page(url)** — Fetch and extract text from a URL (use Jina Reader or custom scraper)
3. **save_note(key, content)** — Save a finding to the agent's scratchpad
4. **read_notes()** — Review all saved notes
5. **write_report(content)** — Finalize and output the report (terminates the loop)

### Agent Behavior
- Takes a research question as input
- Plans what to search for
- Searches, reads, takes notes across multiple queries
- Synthesizes notes into a report with sections and citations
- Stops when it has enough info or hits max iterations (e.g., 20 steps)

### Output Format
```markdown
# Research Report: [Topic]

## Summary
...

## Key Findings
### Finding 1
... [Source: url]

### Finding 2
... [Source: url]

## Conclusion
...

## Sources
1. [title](url) — accessed [date]
```

### Tech Stack (Suggested)
- **Language:** Python or TypeScript
- **LLM:** Claude (tool use) or GPT-4 (function calling)
- **Search:** Tavily API (built for AI) or Brave Search API
- **Page reading:** Jina Reader API or Mozilla Readability

---

## 🧪 Evaluation Criteria

| Criteria | What "good" looks like |
|----------|----------------------|
| **Autonomy** | Agent makes sensible decisions about what to search and when to stop |
| **Quality** | Report is coherent, well-structured, and actually answers the question |
| **Citations** | Every claim traces back to a source URL |
| **Robustness** | Handles failed searches, broken URLs, and irrelevant results |
| **Efficiency** | Doesn't waste tokens re-reading pages or running in circles |

---

## 💡 Tips

- Start with a hardcoded 3-step flow (search → read → write) before making it autonomous
- Add a "thinking" step where the agent reasons about what it knows and what's missing
- Log every step — you need to see the agent's reasoning to debug it
- Set a token budget and track usage. Runaway agents get expensive fast
- Test with both easy topics ("What is photosynthesis?") and hard ones ("Compare CRISPR delivery methods for in-vivo gene therapy")
