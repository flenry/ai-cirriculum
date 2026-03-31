# Project 07: AI SaaS Product (Capstone)

**Phase:** 7 — Capstone
**Difficulty:** ⭐⭐⭐⭐⭐ Expert
**Duration:** 3-4 weeks

---

## 🎯 Objective

Build and launch a real AI-powered SaaS product. It doesn't need to be huge — it needs to be **real**: real users, real value, real payment (even if free tier). This is the project that separates "I can build AI demos" from "I can ship AI products."

---

## 📋 Outcomes

By completing this project you will be able to:

- [ ] Identify a real problem and validate that AI is the right solution
- [ ] Design a product around AI capabilities and limitations (not just "ChatGPT wrapper")
- [ ] Build a complete SaaS: auth, billing, usage limits, onboarding, error handling
- [ ] Manage AI costs at a per-user level (this kills most AI startups)
- [ ] Handle the messy reality: slow responses, hallucinations, edge cases, abuse
- [ ] Launch, get feedback, iterate — the full product loop
- [ ] Talk about what you built in a way that impresses both technical and business audiences

---

## 🏗 Product Ideas (Pick One or Invent Your Own)

### Idea A: AI Code Reviewer
- Connects to GitHub repos via OAuth
- Reviews PRs automatically: security issues, bugs, style, complexity
- Posts comments directly on the PR
- **Why it's good:** Clear value prop, measurable quality, API-heavy

### Idea B: Meeting Intelligence
- Upload meeting recordings (or connect to Zoom/Google Meet)
- Transcribe → summarize → extract action items → send to Slack/email
- Weekly digest of all meetings
- **Why it's good:** Clear ROI, multi-step pipeline, integrations

### Idea C: Customer Support Copilot
- Ingests your docs/knowledge base (RAG)
- Drafts responses to support tickets
- Human reviews and sends (human-in-the-loop)
- Learns from edits over time
- **Why it's good:** RAG + agents + real business value

### Idea D: Content Repurposer
- Input: long-form content (blog post, podcast transcript, video)
- Output: Twitter thread, LinkedIn post, email newsletter, short-form summary
- Customizable tone/voice per platform
- **Why it's good:** Clear market, prompt engineering heavy, sharable output

### Idea E: Your Own Idea
- Must solve a real problem for a specific audience
- Must use AI in a way that's 10x better than the non-AI alternative
- Must be something you'd actually use yourself

---

## 🏗 Technical Requirements

### Must Have
- [ ] User authentication (sign up, log in, manage account)
- [ ] Billing integration (Stripe — even if everything is free, wire it up)
- [ ] Usage tracking and limits (free tier: X requests/month)
- [ ] Error handling that doesn't show raw API errors to users
- [ ] Rate limiting and abuse prevention
- [ ] Basic analytics (who's using what, how often)
- [ ] Mobile-responsive UI
- [ ] Deployed to production with custom domain

### Should Have
- [ ] Onboarding flow that helps new users succeed in < 2 minutes
- [ ] Feedback mechanism (thumbs up/down on AI outputs)
- [ ] Observability (trace AI calls, monitor costs, alert on anomalies)
- [ ] SEO basics (landing page, meta tags, OG images)

### Nice to Have
- [ ] API for programmatic access
- [ ] Team/org support
- [ ] Webhook integrations
- [ ] Usage-based pricing model

---

## 📈 Launch Checklist

- [ ] Landing page that explains value prop in 10 seconds
- [ ] Working product with at least 1 complete user flow
- [ ] Posted on: Product Hunt, Hacker News, Twitter, relevant subreddits
- [ ] Collected feedback from at least 10 real users
- [ ] One iteration based on that feedback
- [ ] Writeup: what you built, why, technical decisions, what you learned

---

## 🧪 Evaluation Criteria

| Criteria | What "good" looks like |
|----------|----------------------|
| **Product** | Solves a real problem, clear value prop, someone would pay for this |
| **Technical** | Clean architecture, cost-managed, observable, secure |
| **Launch** | Actually live, actually used by people who aren't you |
| **Learning** | You can articulate every tradeoff you made and why |
| **Presentation** | README, demo video, or blog post that showcases the work |

---

## 💡 Tips

- **Scope ruthlessly.** V1 should take 2 weeks to build, not 2 months
- **Talk to users before building.** 5 conversations > 50 hours of coding
- **Charge money (or pretend to).** Adding Stripe forces you to think about value
- **Track costs from day 1.** Know your cost-per-user before you have users
- **The AI is 30% of the work.** Auth, billing, error handling, UX — that's the other 70%
- **Write about it.** A blog post about building this is almost as valuable as the product itself
