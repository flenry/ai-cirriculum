# Task: Fix renderer: thumbnailUrl img rendering

**Status:** todo
**Created:** 2026-04-05 16:38:49
**ID:** 202604050838491

---

## Description

In src/renderers/html-renderer.ts, in the wikiHtml block, when brief.wikiArticle.thumbnailUrl is non-null, prepend an img tag: <img src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(title)}" class="wiki-thumb"> before the summary paragraph. Null path emits no img.

## Expected Outcome

Tasks 1.9 and 1.10 turn GREEN. No other tests regress.
