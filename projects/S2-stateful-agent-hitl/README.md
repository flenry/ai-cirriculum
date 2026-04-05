# Project S2: Stateful Conversational Agent with Human-in-the-Loop

**Track:** Sierra
**Phase:** 3 — State Management & Agent Orchestration
**Difficulty:** ⭐⭐⭐⭐ Advanced
**Duration:** 2 weeks

---

## 🎯 Objective

Upgrade your S1 agent into a stateful, multi-turn system with persistent memory, conversation branching, and a human-in-the-loop (HITL) escalation system with a real dashboard. This is what separates a toy chatbot from an enterprise agent.

Sierra's entire value proposition is that their agents handle the conversation *correctly* across many turns, remember context, enforce policies, and know when to hand off to a human. This project teaches all of that.

---

## 📋 Outcomes

By completing this project you will be able to:

- [ ] Model conversations as finite state machines with defined transitions
- [ ] Persist conversation state across turns (survive server restarts)
- [ ] Implement sliding window + summarization for long conversation context
- [ ] Build a HITL escalation system with a web dashboard for human agents
- [ ] Handle conversation branching (user changes topic, comes back later)
- [ ] Implement graceful error recovery (resume from last valid state)

---

## 🏗 Spec

### Part 1: Conversation State Machine

Model the customer support flow as explicit states:

```
┌──────────┐
│ GREETING │
└────┬─────┘
     ▼
┌──────────────┐
│ IDENTIFY_USER│ ←── user provides email/order#
└────┬─────────┘
     ▼
┌──────────────┐
│ IDENTIFY_ISSUE│ ←── what does the user need?
└────┬─────────┘
     ▼
┌─────────────────────────────────────────┐
│            RESOLVE                       │
│  ┌─────────┐ ┌────────┐ ┌────────────┐ │
│  │ REFUND  │ │ RETURN │ │ SUBSCRIPTION││
│  └────┬────┘ └───┬────┘ └─────┬──────┘ │
│       ▼          ▼            ▼         │
│  ┌──────────────────────────────┐       │
│  │ POLICY_CHECK                 │       │
│  │ allowed → EXECUTE_ACTION     │       │
│  │ denied  → EXPLAIN + OFFER_ALT│       │
│  │ needs_approval → ESCALATE    │       │
│  └──────────────────────────────┘       │
└─────────────────────────────────────────┘
     ▼
┌──────────┐
│ CONFIRM  │ ←── confirm action was taken
└────┬─────┘
     ▼
┌──────────────┐
│ ANYTHING_ELSE│ ←── loop back or close
└────┬─────────┘
     ▼
┌──────────┐
│  CLOSE   │
└──────────┘

Special states:
  ESCALATE    → pause agent, notify human
  ERROR       → API failure recovery
  OFF_TOPIC   → redirect to support scope
```

### Implementation
```typescript
interface ConversationState {
  id: string;
  customerId?: string;
  currentState: StateName;
  stateHistory: StateTransition[];
  context: {
    customer?: Customer;
    currentOrder?: Order;
    currentIssue?: Issue;
    pendingAction?: Action;
    previousIssues: Issue[]; // multi-issue support
  };
  memory: {
    messages: Message[];       // sliding window (last 20)
    summary?: string;          // summary of older messages
    facts: Map<string, any>;   // extracted facts (name, email, preferences)
  };
  metadata: {
    createdAt: Date;
    lastActiveAt: Date;
    turnCount: number;
    escalated: boolean;
    assignedHuman?: string;
  };
}
```

### Part 2: Persistent Memory

1. **Conversation persistence** — Store state in SQLite or Postgres. Survive restarts.
2. **Sliding window** — Keep last 20 messages in context. Summarize older ones.
3. **Fact extraction** — After each turn, extract key facts (customer name, order number, issue type) into structured storage. Don't rely on scrolling back through history.
4. **Cross-session memory** — If the same customer comes back tomorrow, recall their previous issues.

```typescript
// After each user message, extract facts
const facts = await extractFacts(message, existingFacts);
// Result: { customerName: "Jane", orderNumber: "1042", issueType: "refund", sentiment: "frustrated" }
```

### Part 3: Human-in-the-Loop Escalation

Build a real escalation system, not just a print statement.

#### When to escalate:
- Refund amount > $100 (policy requires human approval)
- Customer explicitly asks for a human
- Agent confidence is low (3+ failed tool calls, going in circles)
- Sensitive topics detected (legal threats, safety issues, discrimination)
- Agent has been in the same state for 5+ turns without resolution

#### The Dashboard (simple web UI):
```
┌─────────────────────────────────────────────────┐
│ 🔔 Escalation Queue                    3 active │
├─────────────────────────────────────────────────┤
│                                                  │
│ [URGENT] Jane D. — Refund $250 (exceeds limit)  │
│   Issue: Defective product, wants full refund     │
│   Agent recommendation: Approve full refund       │
│   [✅ Approve]  [❌ Deny]  [💬 Take Over]        │
│                                                  │
│ [NORMAL] Bob S. — Requests human agent            │
│   Issue: Complex billing question                 │
│   Context: 3 subscription changes in 2 months     │
│   [💬 Take Over]  [🤖 Return to Agent]           │
│                                                  │
│ [LOW] Alice M. — Agent stuck (5 turns, no resolve)│
│   Issue: Can't find order (possible wrong email)  │
│   [💬 Take Over]  [📝 Add Note & Return]         │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Escalation flow:
1. Agent detects escalation trigger
2. Agent tells customer: "I'm connecting you with a specialist who can help with this. They'll have full context of our conversation."
3. System sends notification (WebSocket to dashboard, or Slack webhook)
4. Dashboard shows: conversation history, customer info, agent's recommendation
5. Human can: approve the action, deny it, take over the conversation, or add a note and return to the agent
6. If approved → agent resumes and executes the action
7. If human takes over → agent becomes silent, human chats directly

### Part 4: Edge Cases & Recovery

Implement handling for:
- **User changes topic mid-flow:** Save current issue state, start new issue flow, offer to return
- **User disappears (timeout):** After 10 min of inactivity, save state. When they return, offer to resume
- **API failure during action:** Roll back state to pre-action, inform user, offer retry or escalation
- **LLM returns garbage:** Detect malformed responses, retry with stricter prompt (max 2 retries), then escalate

### Tech Stack
- **Language:** TypeScript (recommended) or Python
- **LLM:** Claude with tool use
- **State storage:** SQLite (simple) or Postgres (production-like)
- **Dashboard:** Next.js or a simple Express + HTML page
- **Real-time:** WebSocket (Socket.io) or Server-Sent Events for dashboard updates
- **Notifications:** Slack webhook (optional but impressive)

---

## 🧪 Evaluation Criteria

| Criteria | What "good" looks like |
|----------|----------------------|
| **State correctness** | Agent never loses context, even across 20+ turns |
| **Escalation reliability** | Every escalation trigger fires correctly, dashboard receives it in <2s |
| **Recovery** | Server restart → conversation resumes from last state |
| **Multi-issue** | Customer raises 2 issues in one conversation, both resolved correctly |
| **HITL flow** | Human approves/denies action, agent handles both outcomes correctly |

---

## 🧪 Test Scenarios (implement all 10)

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 1 | 15-turn conversation with 3 tool calls | Context maintained throughout |
| 2 | Customer asks for $250 refund | Escalates to dashboard, waits for approval |
| 3 | Human approves the $250 refund | Agent resumes, processes refund, confirms |
| 4 | Human denies the $250 refund | Agent resumes, explains denial, offers alternatives |
| 5 | Customer raises 2 issues (refund + subscription change) | Handles both sequentially |
| 6 | Customer changes topic mid-refund | Saves refund state, handles new topic, offers to return |
| 7 | Customer says "let me talk to a human" | Immediate escalation, full context passed |
| 8 | API goes down during refund processing | Rolls back, informs customer, offers retry |
| 9 | Server restarts mid-conversation | Customer reconnects, conversation resumes seamlessly |
| 10 | Customer returns next day about same issue | Agent recalls previous conversation context |

---

## 💡 Tips

- **Build the state machine on paper first.** Draw every state and transition before writing code. This is a design problem, not a coding problem.
- **Use LangGraph** if you want framework support, but building a custom FSM teaches you more and is closer to what Sierra likely does internally.
- **The dashboard doesn't need to be pretty.** Functional > beautiful. A table with buttons is fine.
- **Test state persistence** by literally killing your server mid-conversation and restarting. This catches 90% of state bugs.
- **The hardest part is multi-issue handling.** Start with single-issue flows and add multi-issue as a second pass.

---

## 🔗 Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/) — State-based agent orchestration
- [XState](https://xstate.js.org/) — Finite state machine library for TypeScript (optional, for learning FSM concepts)
- [Socket.io](https://socket.io/) — WebSocket library for real-time dashboard updates
- Sierra interviews — search "Bret Taylor Sierra agent" on YouTube for product philosophy
