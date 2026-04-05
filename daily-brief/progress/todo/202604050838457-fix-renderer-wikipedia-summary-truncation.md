# Task: Fix renderer: Wikipedia summary truncation

**Status:** todo
**Created:** 2026-04-05 16:38:45
**ID:** 202604050838457

---

## Description

In src/renderers/html-renderer.ts, add a truncateSummary(text, max=280) function: if text.length <= max return text; otherwise slice at 280, find lastIndexOf(' '), return slice + '…'. Apply it to wikiArticle.summary before escapeHtml in the wikiHtml block. Do not touch anything else in the renderer.

## Expected Outcome

Tasks 1.1 and 1.3 turn GREEN. Task 1.2 continues GREEN. No other tests regress.
