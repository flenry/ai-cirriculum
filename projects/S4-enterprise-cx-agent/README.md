# Project S4: Enterprise Customer Experience Agent (Capstone)

**Track:** Sierra
**Phase:** 5 — Portfolio Piece
**Difficulty:** ⭐⭐⭐⭐⭐ Expert
**Duration:** 3 weeks

---

## 🎯 Objective

Combine everything from S1-S3 into a single, polished, deployable customer experience platform. This is the project you link in your Sierra application. It should demonstrate that you can build what Sierra sells.

Think of this as building a **mini Sierra** for a single brand.

---

## 📋 Outcomes

By completing this project you will be able to:

- [ ] Ship a complete, end-to-end enterprise AI agent platform
- [ ] Handle real customer conversations with real API integrations
- [ ] Demonstrate deterministic behavior through policy enforcement
- [ ] Show human-in-the-loop escalation with a working dashboard
- [ ] Prove reliability with a comprehensive eval suite
- [ ] Present the system professionally (README, architecture diagram, demo video)

---

## 🏗 Spec

### The Scenario

You are building an AI agent for **"Acme Electronics"** — a fictional online electronics retailer. The agent handles all customer support via a web chat widget.

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND                                 │
│  ┌──────────────┐              ┌──────────────────────────┐ │
│  │ Customer Chat │              │ Agent Dashboard (HITL)   │ │
│  │ (Next.js)     │              │ - Escalation queue       │ │
│  │ - WebSocket   │              │ - Conversation viewer    │ │
│  │ - Typing anim │              │ - Approve/deny actions   │ │
│  │ - Chat history│              │ - Agent performance      │ │
│  └──────┬───────┘              └───────────┬──────────────┘ │
└─────────┼──────────────────────────────────┼────────────────┘
          │ WebSocket                        │ WebSocket
┌─────────┼──────────────────────────────────┼────────────────┐
│         ▼           BACKEND                ▼                 │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Agent Orchestrator                    │       │
│  │  ┌──────────┐  ┌───────────┐  ┌───────────────┐ │       │
│  │  │ State    │  │ Memory    │  │ Escalation    │ │       │
│  │  │ Machine  │  │ Manager   │  │ Manager       │ │       │
│  │  └──────────┘  └───────────┘  └───────────────┘ │       │
│  └──────────────────────┬───────────────────────────┘       │
│                         │                                    │
│  ┌──────────────────────┼───────────────────────────┐       │
│  │              Guardrails Layer                     │       │
│  │  Input → Policy Engine → Output → Action Guard   │       │
│  └──────────────────────┼───────────────────────────┘       │
│                         │                                    │
│  ┌──────────────────────┼───────────────────────────┐       │
│  │              Tool Execution Layer                 │       │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐│       │
│  │  │Shopify │  │Stripe  │  │Tickets │  │Knowledge││       │
│  │  │API     │  │API     │  │System  │  │Base     ││       │
│  │  └────────┘  └────────┘  └────────┘  └────────┘│       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Data Layer                           │       │
│  │  Postgres: conversations, state, logs, evals     │       │
│  └──────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

### Feature Requirements

#### Customer Chat Interface
- [ ] Clean, modern web chat widget (embeddable)
- [ ] Real-time streaming responses
- [ ] Typing indicator while agent "thinks"
- [ ] Message history persisted per customer
- [ ] "Powered by AI" disclosure with option to request human
- [ ] Mobile responsive

#### Agent Core
- [ ] 10+ tools connected to Shopify + Stripe (from S1)
- [ ] Finite state machine conversation management (from S2)
- [ ] Sliding window memory with summarization (from S2)
- [ ] Cross-session memory (recognize returning customers)
- [ ] Multi-issue handling within one conversation

#### Policy Engine
- [ ] All business rules enforced in code (from S1)
- [ ] Configurable policies (JSON/YAML config, not hardcoded)
- [ ] Policy violation logging for audit trail
- [ ] Clear customer-facing explanations when policy blocks an action

#### Human-in-the-Loop Dashboard
- [ ] Real-time escalation queue (from S2)
- [ ] Full conversation history viewer with tool call details
- [ ] One-click approve/deny for pending actions
- [ ] "Take over" mode — human chats directly, agent goes silent
- [ ] "Return to agent" — hand conversation back to AI
- [ ] Basic analytics: conversations/day, escalation rate, resolution time

#### Safety & Guardrails
- [ ] 3-layer guardrails: input, output, action (from S3)
- [ ] Prompt injection defense
- [ ] PII masking in all logs
- [ ] Off-topic deflection
- [ ] Brand voice consistency

#### Eval Suite
- [ ] 50+ automated test scenarios (from S3)
- [ ] CI-runnable (eval suite runs on every PR)
- [ ] Performance metrics dashboard or report
- [ ] Regression detection (alert when scores drop)

### Acme Electronics Policies (configurable)

```yaml
# policies.yaml
company:
  name: "Acme Electronics"
  support_hours: "24/7 AI, human agents 9am-5pm PST"
  
refund:
  window_days: 30
  requires_receipt: true
  max_auto_approve_amount: 100.00
  above_threshold_action: "escalate_to_human"
  excluded_categories: ["clearance", "final_sale"]
  
return:
  window_days: 14
  condition: "unopened or defective"
  customer_pays_shipping: true
  restocking_fee_percent: 0  # no restocking fee
  
warranty:
  standard_days: 365
  extended_available: true
  requires_proof_of_defect: true
  
subscription:
  cancel_anytime: true
  prorated_refund: true
  retention_offer: "one_month_free"  # agent can offer 1 free month before canceling
  
escalation:
  triggers:
    - "customer_requests_human"
    - "refund_above_threshold"
    - "legal_threat_detected"
    - "agent_stuck_turns: 5"
    - "negative_sentiment_sustained: 3"  # 3 consecutive negative messages
  
agent_persona:
  name: "Alex"
  tone: "friendly, professional, empathetic"
  never_say: ["unfortunately", "I'm just an AI", "I can't help"]
  always_do: ["acknowledge frustration", "offer alternatives when denying", "confirm actions before executing"]
```

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend (chat) | Next.js + Tailwind + shadcn/ui |
| Frontend (dashboard) | Same Next.js app, separate routes |
| Backend | Node.js (Express or Fastify) or Next.js API routes |
| LLM | Claude (Anthropic SDK) with tool use |
| Database | Postgres (Supabase or local) |
| Real-time | WebSocket (Socket.io) or Server-Sent Events |
| E-commerce API | Shopify Admin API |
| Payments API | Stripe API |
| Eval runner | Custom + Promptfoo |
| Deployment | Vercel (frontend) + Railway/Fly.io (backend) |

---

## 📦 Deliverables

### 1. GitHub Repository
- Clean, well-organized monorepo
- Comprehensive README with:
  - What this is and why you built it
  - Architecture diagram (the one above, or better)
  - How to run locally
  - How to run the eval suite
  - Design decisions and tradeoffs
- CI pipeline that runs evals on every PR

### 2. Demo Video (2-3 minutes)
Record a Loom showing:
1. Customer asks about an order → agent looks it up
2. Customer requests a refund → agent processes it (within policy)
3. Customer requests a large refund → agent escalates to dashboard
4. You approve/deny from the dashboard → agent resumes
5. Customer tries prompt injection → agent deflects
6. Quick flash of eval suite results

### 3. Blog Post / Writeup
Write a 1500-2000 word post covering:
- The architecture and why you made each choice
- How you enforce policies in code (not prompts)
- The hardest bugs you encountered and how you fixed them
- Eval results and what they taught you
- What you'd do differently in v2

### 4. Agent Safety Report
The generated report from S3, updated for the final system.

---

## 🧪 Evaluation Criteria

| Criteria | What "good" looks like |
|----------|----------------------|
| **End-to-end flow** | A stranger can open the chat, have a real support conversation, and get their issue resolved |
| **Determinism** | Run the same scenario 10 times, get the same outcome 10 times |
| **Policy compliance** | 0 policy violations across all 50+ eval scenarios |
| **Escalation** | HITL works smoothly — human sees full context, can act, agent resumes correctly |
| **Safety** | All 15 adversarial scenarios defended against |
| **Code quality** | Clean TypeScript, typed interfaces, separation of concerns, tested |
| **Presentation** | README, video, and writeup are portfolio-grade |

---

## 🗓 Suggested 3-Week Schedule

**Week 1: Core Integration**
- Day 1-2: Set up monorepo, database schema, project structure
- Day 3-4: Port S1 agent core + tools into the new architecture
- Day 5-7: Build chat UI with streaming + conversation persistence

**Week 2: State, HITL & Guardrails**
- Day 1-2: Port S2 state machine + memory system
- Day 3-4: Build HITL dashboard with real-time escalation
- Day 5-7: Implement 3-layer guardrails + configurable policies

**Week 3: Evals, Polish & Ship**
- Day 1-2: Port S3 eval suite, run full eval, fix failures
- Day 3-4: Deploy to production, test end-to-end
- Day 5-6: Record demo video, write blog post, generate safety report
- Day 7: Final polish, push to GitHub, share

---

## 💡 Tips

- **This is a portfolio piece, not a startup.** Don't over-engineer. A clean, working demo beats a half-finished enterprise system.
- **The README is half the project.** A Sierra engineer will look at your GitHub before they look at your code. The README must immediately communicate competence.
- **Record the demo video as if you're presenting to Sierra's engineering team.** Technical but clear. Show the architecture, not just the UI.
- **The policy engine is your key differentiator.** Anyone can build a chatbot. The code-level policy enforcement is what makes this Sierra-relevant.
- **Deploy it.** A live URL is worth 10x a localhost demo. Use free tiers (Vercel + Supabase + Railway).
- **Run the eval suite in CI.** Even if it's just GitHub Actions running `npm run eval`. This shows production mindset.

---

## 🔗 Resources

- [Sierra.ai](https://sierra.ai) — Study their messaging, case studies, and product philosophy
- [Bret Taylor Interviews](https://www.youtube.com/results?search_query=bret+taylor+sierra+ai) — Understand the founder's vision
- [Vercel AI SDK](https://sdk.vercel.ai/) — Handles streaming, tool calls, and multiple providers
- [shadcn/ui](https://ui.shadcn.com/) — Clean UI components for the chat interface
- [Supabase](https://supabase.com/) — Postgres + auth + real-time for free tier
