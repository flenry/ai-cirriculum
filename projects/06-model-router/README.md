# Project 06: Intelligent Model Router

**Phase:** 5 — Production AI Engineering
**Difficulty:** ⭐⭐⭐ Intermediate
**Duration:** 1 week

---

## 🎯 Objective

Build a model routing layer that classifies incoming queries by complexity and routes them to the most cost-effective model. Simple questions go to a cheap/fast model, complex ones go to a powerful model. This is how AI-first companies keep costs under control at scale.

---

## 📋 Outcomes

By completing this project you will be able to:

- [ ] Classify query complexity programmatically (heuristics + LLM-based)
- [ ] Implement a routing layer that sits between your app and multiple LLM providers
- [ ] Measure and compare cost/latency/quality tradeoffs across models
- [ ] Build a fallback chain (if model A fails or is slow, try model B)
- [ ] Log routing decisions and build a dashboard to analyze patterns
- [ ] Understand real-world cost optimization at scale

---

## 🏗 Spec

### Router Architecture
```
User Query
    ↓
Classifier (fast, cheap)
    ↓
┌─────────────────────────────────────┐
│  simple → Haiku / GPT-4o-mini       │
│  medium → Sonnet / GPT-4o           │
│  complex → Opus / GPT-4 / o1        │
│  code → specialized code model      │
└─────────────────────────────────────┘
    ↓
Response + metadata (model used, tokens, cost, latency)
```

### Classification Signals
- **Heuristic:** Query length, presence of code, number of constraints, domain keywords
- **LLM-based:** Use a tiny/fast model to classify before routing (meta-prompt)
- **Hybrid:** Heuristics first, LLM classifier for ambiguous cases

### Features
1. **Multi-provider support** — Anthropic, OpenAI, local models (Ollama)
2. **Fallback chain** — If primary model times out or errors, cascade to backup
3. **Cost tracking** — Log every request with model, tokens in/out, cost, latency
4. **Quality monitoring** — Sample responses and score quality (LLM-as-judge)
5. **Dashboard** — Simple web UI showing cost savings, routing distribution, quality scores

### API Design
```typescript
// The router exposes the same interface regardless of backend model
const response = await router.chat({
  messages: [...],
  // Optional: override routing
  routing: "auto" | "cheap" | "best" | "fast",
  maxCost: 0.05, // max $ per request
});

// Response includes routing metadata
response.model    // "claude-3-haiku"
response.cost     // 0.002
response.latency  // 340ms
response.routing  // { classified: "simple", routed: "haiku", reason: "short factual query" }
```

---

## 🧪 Evaluation Criteria

| Criteria | What "good" looks like |
|----------|----------------------|
| **Cost savings** | 40-60% cost reduction vs sending everything to the best model |
| **Quality preservation** | <5% quality degradation on a test set (measure with evals) |
| **Latency** | Routing overhead < 200ms (heuristic) or < 1s (LLM classifier) |
| **Reliability** | Fallback chain handles outages gracefully |
| **Observability** | Every routing decision is logged and queryable |

---

## 💡 Tips

- Start with pure heuristics (regex, length, keyword matching). They're surprisingly effective
- Build an eval set of 50 queries across difficulty levels. Measure quality at each routing tier
- The classifier doesn't need to be perfect — slightly over-routing to expensive models is fine, massively under-routing hurts quality
- Consider caching — identical or very similar queries shouldn't hit the LLM again
- This is a great project to talk about in interviews — it shows you think about production economics
