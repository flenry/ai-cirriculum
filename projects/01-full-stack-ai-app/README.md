# Project 01: Full-Stack AI App

**Phase:** 2 — Building with AI
**Difficulty:** ⭐⭐⭐ Intermediate
**Duration:** 1-2 weeks

---

## 🎯 Objective

Build and deploy a complete AI-powered web application with user authentication, conversation persistence, cost tracking, and production guardrails. This is your first portfolio piece — it should be polished enough that a hiring manager can sign up and use it.

---

## 📋 Outcomes

By completing this project you will be able to:

- [ ] Integrate LLM APIs (Anthropic/OpenAI) into a web application with streaming responses
- [ ] Implement conversation history and context management
- [ ] Handle auth, rate limiting, and per-user cost tracking
- [ ] Add content moderation and output guardrails
- [ ] Deploy a production AI app (Vercel, Railway, or Fly.io)
- [ ] Manage API keys, environment variables, and secrets securely

---

## 🏗 Spec

### Core Features
1. **Chat interface** — Clean UI with streaming responses, markdown rendering, code highlighting
2. **Auth** — Email/password or OAuth (Clerk, NextAuth, Supabase Auth)
3. **Conversation storage** — Save/load/delete conversations (Postgres or SQLite)
4. **System prompt customization** — Let users configure behavior
5. **Cost dashboard** — Track tokens used per conversation, show estimated cost

### Stretch Features
- Model selection (Claude, GPT-4, etc.)
- File upload + vision (analyze images)
- Semantic caching (cache similar queries)
- Share conversations via link
- Export to markdown

### Tech Stack (Suggested)
- **Frontend:** Next.js 14+ (App Router) or SvelteKit
- **Backend:** API routes or separate Express/Fastify server
- **Database:** Postgres (Supabase or Neon) or SQLite
- **AI:** Anthropic SDK or OpenAI SDK
- **Auth:** Clerk, NextAuth, or Supabase Auth
- **Deploy:** Vercel or Railway

---

## 🧪 Evaluation Criteria

| Criteria | What "good" looks like |
|----------|----------------------|
| **Functionality** | All core features work reliably, errors are handled gracefully |
| **UX** | Streaming feels fast, loading states are clear, mobile responsive |
| **Security** | API keys server-side only, rate limiting in place, no prompt injection via user input |
| **Code quality** | Clean separation of concerns, typed (TypeScript), tested |
| **Deployment** | Live URL, works for anyone, README with setup instructions |

---

## 💡 Tips

- Start with a working chat → then add auth → then add persistence → then polish
- Use the Vercel AI SDK — it handles streaming, tool calls, and multiple providers
- Don't over-engineer. A clean, working app beats a complex broken one
- Actually deploy it. A localhost demo is worth 10% of a live app
