# Project 08: MCP Server Toolkit

**Phase:** 4 — MCP, Tool Ecosystems & Agent Infrastructure
**Difficulty:** ⭐⭐⭐ Intermediate
**Duration:** 1-2 weeks

---

## 🎯 Objective

Build 3-5 production-quality MCP (Model Context Protocol) servers that expose real-world tools and data sources to AI models. Publish them so others can use them. This teaches you the protocol layer that's becoming the standard for how AI connects to everything.

---

## 📋 Outcomes

By completing this project you will be able to:

- [ ] Understand the MCP protocol: transports (stdio, SSE), capabilities (tools, resources, prompts), lifecycle
- [ ] Build MCP servers in TypeScript or Python using the official SDKs
- [ ] Design clean tool interfaces (good names, descriptions, typed parameters, clear errors)
- [ ] Handle authentication (API keys, OAuth tokens) securely in MCP servers
- [ ] Test MCP servers with Claude Desktop, pi, or the MCP Inspector
- [ ] Publish MCP servers to npm or PyPI for others to install
- [ ] Understand how MCP fits into the bigger picture of agent orchestration

---

## 🏗 Spec

### Build These MCP Servers

#### Server 1: REST API Wrapper
Pick an API you actually use and wrap it as an MCP server:
- **Options:** Notion, Linear, GitHub Issues, Todoist, Airtable, Slack
- **Tools:** CRUD operations (list, get, create, update, delete)
- **Resources:** Expose key data as MCP resources (e.g., current projects, recent items)
- **Auth:** API key or OAuth token via environment variable

#### Server 2: Database Query Tool
- Connect to a Postgres or SQLite database
- **Tools:**
  - `query(sql)` — Run SELECT queries only (read-only safety)
  - `describe_table(name)` — Get schema for a table
  - `list_tables()` — Show all tables
- **Safety:** SQL validation — reject DROP, DELETE, UPDATE, INSERT. Only SELECT allowed
- **Resources:** Expose schema as a resource so the LLM understands the data model

#### Server 3: Domain-Specific Tool
Build something unique to a domain you care about:
- **Finance:** Stock prices, financial ratios, earnings data (via Yahoo Finance or Alpha Vantage)
- **DevOps:** Server health checks, deploy status, log search
- **Content:** SEO analysis, readability scoring, keyword research
- **Data:** CSV/Excel file analysis, statistical summaries, chart generation

#### Server 4 (Bonus): Composite Server
A server that combines multiple data sources:
- Example: "Project Intelligence" — pulls from GitHub (PRs, issues), Linear (tasks), and Slack (messages) to give a unified project status
- This teaches you how MCP servers can be composed

### Quality Requirements
Each server must have:
- [ ] Clear README with setup instructions
- [ ] Typed tool parameters (Zod for TS, Pydantic for Python)
- [ ] Helpful tool descriptions (the LLM reads these to decide when to use the tool)
- [ ] Error handling (don't crash on bad input, return useful error messages)
- [ ] At least 3 example interactions showing the server in use
- [ ] Published to npm or PyPI (even if v0.1.0)

---

## 🧪 Evaluation Criteria

| Criteria | What "good" looks like |
|----------|----------------------|
| **Usefulness** | Tools solve real problems, not toy examples |
| **DX** | Easy to install, configure, and use. Clear docs |
| **Reliability** | Handles errors, bad input, network failures gracefully |
| **Security** | Read-only where appropriate, no credential leaks, input validation |
| **Protocol compliance** | Follows MCP spec correctly, works with multiple clients |

---

## 💡 Tips

- Start by using 3-4 existing MCP servers (filesystem, GitHub, Brave search) to understand the UX from the consumer side
- Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to test your servers without needing a full client
- Tool descriptions are prompts — write them like you're explaining to a smart intern what the tool does and when to use it
- Don't expose everything an API can do. Curate the most useful 5-10 operations
- Think about what the LLM needs vs what a human needs — LLMs want structured data, not HTML
- This is extremely hireable work right now. Companies are building MCP servers for their internal tools and need people who know how
