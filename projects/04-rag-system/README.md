# Project 04: Production RAG System

**Phase:** 2 — Building with AI
**Difficulty:** ⭐⭐⭐⭐ Advanced
**Duration:** 2 weeks

---

## 🎯 Objective

Build a retrieval-augmented generation system that lets users chat with a large document corpus. Go beyond the basic tutorial — implement chunking strategies, hybrid search, reranking, citation tracking, and an eval pipeline that measures retrieval and generation quality separately.

---

## 📋 Outcomes

By completing this project you will be able to:

- [ ] Design a document ingestion pipeline (PDF/HTML/Markdown → chunks → embeddings → vector DB)
- [ ] Implement and compare chunking strategies (fixed-size, recursive, semantic)
- [ ] Set up a vector database (pgvector, Chroma, or Pinecone) with metadata filtering
- [ ] Implement hybrid search (vector similarity + keyword/BM25)
- [ ] Add a reranking step (Cohere Rerank or cross-encoder)
- [ ] Generate answers with inline citations that trace back to source chunks
- [ ] Build an eval pipeline that measures retrieval recall, precision, and answer faithfulness
- [ ] Understand when RAG fails and how to diagnose it

---

## 🏗 Spec

### Ingestion Pipeline
1. **Load** — Accept PDF, Markdown, HTML, plain text
2. **Parse** — Extract text, preserve structure (headings, tables)
3. **Chunk** — Split into overlapping chunks (implement at least 2 strategies)
4. **Embed** — Generate embeddings (OpenAI `text-embedding-3-small` or Cohere `embed-v3`)
5. **Store** — Insert into vector DB with metadata (source file, page number, section heading)

### Retrieval Pipeline
1. **Query** — User asks a question
2. **Embed query** — Same model as ingestion
3. **Vector search** — Top 20 candidates
4. **Keyword search** — BM25 over the same corpus (hybrid)
5. **Merge + Rerank** — Combine results, rerank to top 5
6. **Generate** — LLM answers using top 5 chunks as context, with citations

### Eval Pipeline
- **Retrieval eval:** Given a question + known relevant chunks, measure recall@5 and precision@5
- **Generation eval:** Given a question + context + expected answer, measure faithfulness (does the answer stay grounded in the context?) and relevance
- **End-to-end eval:** Given a question + expected answer, measure overall quality
- Create a test set of 30+ question-answer pairs with known source chunks

### Tech Stack (Suggested)
- **Vector DB:** pgvector (in Supabase/Neon), Chroma, or Pinecone
- **Embeddings:** OpenAI or Cohere
- **Reranking:** Cohere Rerank or a cross-encoder from HuggingFace
- **LLM:** Claude or GPT-4
- **Keyword search:** SQLite FTS5, Elasticsearch, or a simple BM25 library
- **Framework:** Build from scratch (preferred for learning) or LlamaIndex

---

## 🧪 Evaluation Criteria

| Criteria | What "good" looks like |
|----------|----------------------|
| **Retrieval quality** | Relevant chunks in top 5 for 80%+ of test questions |
| **Answer quality** | Answers are grounded in sources, not hallucinated |
| **Citations** | Every claim links to a specific chunk with source + page |
| **Eval pipeline** | Automated, reproducible, catches regressions |
| **Architecture** | Clean, each stage is independently testable and swappable |

---

## 💡 Tips

- Start with a small corpus (10-20 documents). Get it working before scaling
- The #1 RAG failure mode is bad chunking. If the right info isn't in a chunk, retrieval can't find it
- Always test retrieval separately from generation — know where failures happen
- Reranking is the highest-ROI improvement you can add to basic RAG
- Log the retrieved chunks for every query during development — you'll spot issues fast
- Consider a "no answer" path — the system should say "I don't know" when context doesn't contain the answer
