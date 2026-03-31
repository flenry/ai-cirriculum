# 🧠 The AI Expert Curriculum

**Goal:** Go from "I use AI" to "I build with AI professionally" — hireable by AI-first companies or ready to start your own.

**Total Duration:** ~5-6 months (self-paced)

---

## Phase 0: Foundations — How AI Actually Works
**⏱ 2-3 weeks | Goal: Stop being a black-box user**

### Module 0.1 — Machine Learning Core Concepts
- **What to learn:** Supervised vs unsupervised learning, regression, classification, loss functions, gradient descent, overfitting/underfitting
- **Resource:** [fast.ai Practical Deep Learning](https://course.fast.ai/) — Part 1, Lessons 1-4
- **Resource:** 3Blue1Brown — [Neural Networks playlist](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi) (4 videos, ~1hr total)
- **Hands-on:** Train a simple classifier in a Jupyter notebook (MNIST or similar)

### Module 0.2 — How LLMs Work
- **What to learn:** Tokenization, embeddings, attention mechanism, transformer architecture, pretraining vs fine-tuning, RLHF, context windows, temperature/top-p
- **Resource:** Andrej Karpathy — [Let's build GPT from scratch](https://www.youtube.com/watch?v=kCc8FmEb1nY) (2hrs, watch it all)
- **Resource:** Jay Alammar — [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- **Resource:** Anthropic's [Research on mechanistic interpretability](https://transformer-circuits.pub/)
- **Hands-on:** Tokenize text with `tiktoken`, visualize token counts, understand why prompts cost what they cost

### Module 0.3 — The AI Landscape
- **What to learn:** Foundation models (GPT-4, Claude, Gemini, Llama, Mistral), open vs closed, multimodal models, image gen (Stable Diffusion, DALL-E, Midjourney), voice (Whisper, ElevenLabs), video (Sora, Runway)
- **Resource:** Read the technical reports/model cards for Claude 3.5, GPT-4, Llama 3
- **Deliverable:** Write a 1-page comparison matrix of 5 major models (strengths, weaknesses, pricing, context windows, best use cases)

---

## Phase 1: Prompt Engineering Mastery
**⏱ 2 weeks | Goal: Extract maximum value from any model**

### Module 1.1 — Prompting Techniques
- **What to learn:** Zero-shot, few-shot, chain-of-thought, tree-of-thought, self-consistency, role prompting, system prompts, structured output (JSON mode), prompt chaining
- **Resource:** [Anthropic's Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)
- **Resource:** [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- **Hands-on:** Build a prompt library of 20+ battle-tested prompts for different tasks

### Module 1.2 — Advanced Prompting
- **What to learn:** Meta-prompting (prompts that write prompts), constrained generation, prompt injection defense, evals (how to measure prompt quality), A/B testing prompts
- **Hands-on:** Take one task, write 5 different prompts, eval them against 20 test cases, measure accuracy
- **Deliverable:** A personal prompt engineering playbook (Notion/Markdown doc)

---

## Phase 2: Building with AI — APIs & Application Layer
**⏱ 3-4 weeks | Goal: Build production-grade AI applications**

### Module 2.1 — API Fundamentals
- **What to learn:** REST APIs, streaming responses, function calling / tool use, structured outputs, vision APIs, embeddings API
- **Resource:** [Anthropic API docs](https://docs.anthropic.com/) + [OpenAI API docs](https://platform.openai.com/docs)
- **Hands-on:** Build a CLI chatbot with streaming, conversation history, and system prompts (Python or TypeScript)
- **Project:** → [01-full-stack-ai-app](./projects/01-full-stack-ai-app/)

### Module 2.2 — RAG (Retrieval-Augmented Generation)
- **What to learn:** Vector embeddings, similarity search, chunking strategies, vector databases (Pinecone, Chroma, pgvector), hybrid search, reranking, evaluation metrics (faithfulness, relevance)
- **Resource:** [LangChain RAG tutorial](https://python.langchain.com/docs/tutorials/rag/)
- **Hands-on:** Build a "chat with your docs" app — ingest PDFs, chunk, embed, retrieve, generate
- **Advanced:** Implement a RAG eval pipeline (test retrieval quality + generation quality separately)
- **Project:** → [04-rag-system](./projects/04-rag-system/)

### Module 2.3 — Fine-Tuning & Training
- **What to learn:** When to fine-tune vs prompt engineer vs RAG, LoRA/QLoRA, dataset preparation, evaluation, deploying fine-tuned models
- **Resource:** [Hugging Face PEFT docs](https://huggingface.co/docs/peft)
- **Hands-on:** Fine-tune a small open model (Llama 3 8B or Mistral 7B) on a custom dataset using QLoRA
- **Key insight:** Know when NOT to fine-tune — most problems are solved by better prompts + RAG

### Module 2.4 — Full-Stack AI App
- **What to learn:** Auth, rate limiting, cost management, caching (semantic cache), guardrails, content moderation, logging/observability
- **Project:** → [01-full-stack-ai-app](./projects/01-full-stack-ai-app/)

---

## Phase 3: AI Agents — The Big Leap
**⏱ 3-4 weeks | Goal: Build autonomous systems that actually work**

### Module 3.1 — Agent Fundamentals
- **What to learn:** ReAct pattern (Reason + Act), tool use, planning, memory (short-term/long-term), agent loops, when agents fail and why
- **Resource:** [Anthropic's agent guide](https://docs.anthropic.com/en/docs/build-with-claude/agentic)
- **Resource:** Lilian Weng — [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) (essential reading)
- **Project:** → [02-research-agent](./projects/02-research-agent/)

### Module 3.2 — Agent Frameworks
- **What to learn:** LangGraph, CrewAI, AutoGen, Anthropic tool use patterns, OpenAI Assistants API — understand the tradeoffs, don't marry a framework
- **Hands-on:** Build the same agent in 2 different frameworks, compare DX and reliability
- **Key insight:** Frameworks abstract complexity but hide failure modes. Always understand what's happening underneath.

### Module 3.3 — Coding Agents
- **What to learn:** How tools like Cursor, Copilot, Claude Code, pi, Devin, and Codegen work. Code generation, code review, test generation, autonomous debugging loops
- **Hands-on:** Use pi/Claude Code to build a full project — observe the patterns (read → plan → edit → test → iterate)
- **Project:** → [05-coding-agent](./projects/05-coding-agent/)

### Module 3.4 — Multi-Agent Orchestration
- **What to learn:** Agent-to-agent communication, orchestrator patterns (supervisor, pipeline, debate), task decomposition, consensus, error handling and recovery, human-in-the-loop checkpoints
- **Patterns to implement:**
  1. **Pipeline** — Agent A → Agent B → Agent C (sequential)
  2. **Fan-out/Fan-in** — Orchestrator dispatches to N workers, aggregates results
  3. **Supervisor** — Manager agent delegates, reviews, re-delegates
  4. **Debate** — Two agents argue, a judge decides
- **Project:** → [03-multi-agent-pipeline](./projects/03-multi-agent-pipeline/)

---

## Phase 4: MCP, Tool Ecosystems & Agent Infrastructure
**⏱ 2-3 weeks | Goal: Master the protocol layer that connects AI to the real world**

This is the connective tissue of modern AI systems. MCP (Model Context Protocol) is becoming the USB-C of AI — the standard way models talk to tools, data, and services.

### Module 4.1 — MCP (Model Context Protocol) Deep Dive
- **What to learn:** What MCP is and why it exists, client/server architecture, transport layers (stdio, SSE, HTTP), the protocol spec (tools, resources, prompts, sampling)
- **Resource:** [MCP Specification](https://modelcontextprotocol.io/)
- **Resource:** [Anthropic MCP docs](https://docs.anthropic.com/en/docs/build-with-claude/mcp)
- **Resource:** [MCP GitHub — SDKs & examples](https://github.com/modelcontextprotocol)
- **Hands-on:** Set up 3-5 existing MCP servers (filesystem, GitHub, database, Brave search) and use them with Claude Desktop or pi
- **Key insight:** MCP turns every API, database, and service into a tool an LLM can use without custom integration code

### Module 4.2 — Building MCP Servers
- **What to learn:** Building custom MCP servers (TypeScript SDK or Python SDK), exposing tools/resources/prompts, input validation with Zod/Pydantic, error handling, auth patterns
- **Resource:** [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- **Resource:** [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- **Hands-on:** Build 3 MCP servers:
  1. A wrapper around a REST API you use (e.g., Notion, Linear, Slack)
  2. A database query tool (read-only SQL with guardrails)
  3. A domain-specific tool (e.g., financial data, code analysis, CRM)
- **Project:** → [08-mcp-server-toolkit](./projects/08-mcp-server-toolkit/)

### Module 4.3 — Hooks, Skills & Agent Customization
- **What to learn:** How coding agents like pi, Claude Code, and Cursor are customized via hooks (lifecycle events), skills (reusable instruction sets), custom system prompts, tool permissions
- **Resource:** pi documentation on [skills](/Users/cedric/.nvm/versions/node/v24.13.0/lib/node_modules/@mariozechner/pi-coding-agent/docs/skills.md), [extensions](/Users/cedric/.nvm/versions/node/v24.13.0/lib/node_modules/@mariozechner/pi-coding-agent/docs/extensions.md)
- **Resource:** Claude Code hooks documentation
- **Hands-on:**
  - Write a custom pi skill that automates a workflow you do repeatedly
  - Set up hooks that enforce coding standards (lint on save, auto-test, etc.)
  - Create a `.claude` or `.pi` project config that makes AI behave exactly how you want per-repo
- **Key insight:** The best AI engineers don't just use tools — they configure and extend them to multiply their leverage

### Module 4.4 — Tool Ecosystem Architecture
- **What to learn:** How to design a tool ecosystem for a team/company: which MCP servers to run, security boundaries, sandboxing, tool composition, gateway patterns, rate limiting tools, audit logging
- **Hands-on:** Design (on paper + diagram) an MCP architecture for a hypothetical company:
  - Internal tools (Jira, Slack, GitHub, DB) exposed via MCP
  - Role-based access (eng vs PM vs support get different tools)
  - Audit trail of every tool invocation
- **Deliverable:** Architecture doc + diagram (portfolio piece)

---

## Phase 5: Production AI Engineering
**⏱ 2-3 weeks | Goal: Ship reliable AI systems**

### Module 5.1 — Evals & Testing
- **What to learn:** LLM-as-judge, human evals, automated test suites, regression testing for prompts, A/B testing in production, eval frameworks (Braintrust, Promptfoo)
- **Resource:** [Hamel Husain's eval guide](https://hamel.dev/blog/posts/evals/)
- **Hands-on:** Build an eval suite for one of your earlier projects — catch regressions when you change prompts

### Module 5.2 — Observability & Debugging
- **What to learn:** Tracing agent runs, token usage monitoring, latency tracking, error classification, tools (Langfuse, LangSmith, Helicone, Braintrust)
- **Hands-on:** Add observability to your multi-agent system — trace every LLM call, measure cost/latency/quality

### Module 5.3 — Cost & Latency Optimization
- **What to learn:** Model routing (cheap model for easy tasks, expensive for hard), caching strategies, prompt compression, batch processing, when to use smaller/local models
- **Project:** → [06-model-router](./projects/06-model-router/)

### Module 5.4 — Safety & Security
- **What to learn:** Prompt injection (direct & indirect), jailbreaks, data exfiltration, PII handling, output filtering, sandboxing agent actions, principle of least privilege for tools
- **Resource:** [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- **Hands-on:** Red-team your own app — try to break it, then fix it

---

## Phase 6: The Business Layer
**⏱ 2 weeks | Goal: Think like an AI-first founder/leader**

### Module 6.1 — AI Product Thinking
- **What to learn:** Identifying high-value AI use cases, build vs buy decisions, pricing AI products, managing AI costs at scale, UX for AI products (latency tolerance, error handling, confidence display)
- **Read:** How Cursor, Jasper, Harvey, Sierra, Glean built their businesses
- **Exercise:** Find 3 industries, identify one AI product opportunity in each, write a 1-page business case for each

### Module 6.2 — AI-First Company Operations
- **What to learn:** How AI-first companies are structured, roles (AI engineer, ML engineer, prompt engineer, AI product manager), hiring, team composition, build culture
- **Read:** AI engineer job postings from 20 companies — extract the common skill requirements
- **Exercise:** Design the tech stack and team structure for an AI-first startup

### Module 6.3 — Staying Current
- **What to learn:** How to keep up without drowning
- **Follow:** @AnthropicAI, @OpenAI, @karpathy, @swyx, @simonw
- **Read weekly:** The Batch (Andrew Ng), Ben's Bites, Latent Space podcast
- **Habit:** Every week, read 1 paper or technical blog post. Summarize it in 3 sentences.

---

## Phase 7: Capstone Projects (Pick 2)
**⏱ 3-4 weeks | Goal: Portfolio pieces that prove expertise**

| # | Project | Skills Demonstrated |
|---|---------|-------------------|
| 1 | **AI SaaS Product** — Build and launch a real product. Charge money. | Full-stack, product, business |
| 2 | **Open-source Agent Framework** — Minimal but opinionated agent orchestration lib | Architecture, open-source, agents |
| 3 | **Enterprise RAG System** — Multi-tenant, RBAC, citation tracking, eval dashboard | RAG, security, production |
| 4 | **MCP Server Collection** — 5+ production MCP servers published to npm/PyPI | Protocol, tooling, open-source |
| 5 | **AI Automation Agency** — Automate 3 real workflows for real businesses | Business, integration, agents |
| 6 | **Technical Blog / YouTube** — 10 deep-dive posts on AI engineering | Communication, expertise signaling |

→ Project details in [projects/07-ai-saas-product](./projects/07-ai-saas-product/)

---

## 📅 Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| 0 — Foundations | 2-3 weeks | How AI works |
| 1 — Prompting | 2 weeks | Extract max value |
| 2 — Building | 3-4 weeks | APIs, RAG, apps |
| 3 — Agents | 3-4 weeks | Autonomous systems |
| 4 — MCP & Tools | 2-3 weeks | Protocol & infrastructure |
| 5 — Production | 2-3 weeks | Ship reliably |
| 6 — Business | 2 weeks | Think strategically |
| 7 — Capstone | 3-4 weeks | Prove it |
| **Total** | **~5-6 months** | **Full-stack AI expert** |

---

## 🎯 How You Know You're Ready

- [ ] Explain transformers to a non-technical person in 2 minutes
- [ ] Look at any business process and identify where AI adds value (and where it doesn't)
- [ ] Build a RAG pipeline from scratch without a framework
- [ ] Design and implement a multi-agent system with error recovery
- [ ] Build and publish an MCP server that others can use
- [ ] Configure coding agents (pi, Claude Code) with custom skills/hooks for your workflow
- [ ] Set up evals that catch regressions before users do
- [ ] Red-team your own systems for prompt injection
- [ ] Estimate the cost of an AI feature before building it
- [ ] Ship a production AI app that real people use
- [ ] Have 2-3 public portfolio pieces that demonstrate depth

---

## 📜 Certifications

### Anthropic Claude Certified Architect (Foundations)
- **URL:** https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request
- **Status:** Currently requires a partner email to access
- **Known topics (based on public info):**
  - Claude model capabilities and limitations
  - Prompt engineering best practices
  - API usage and integration patterns
  - Tool use and function calling
  - RAG architecture with Claude
  - Safety, responsible use, and Constitutional AI
  - Enterprise deployment patterns
  - Cost optimization and model selection
- **Note:** This curriculum covers all expected cert topics and goes deeper. When access opens up, you'll be over-prepared.
- **Alternative certs:** [DeepLearning.AI courses on Coursera](https://www.coursera.org/deeplearning-ai), [AWS ML Specialty](https://aws.amazon.com/certification/certified-machine-learning-specialty/), [Google Cloud ML Engineer](https://cloud.google.com/learn/certification/machine-learning-engineer)

---

*Last updated: 2026-03-29*
