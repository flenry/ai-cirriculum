# Task: Test: Wikipedia truncation (failing)

**Status:** todo
**Created:** 2026-04-05 16:38:08
**ID:** 202604050838086

---

## Description

Write a failing Vitest test in tests/renderers/html-renderer.test.ts named 'truncates Wikipedia summary at word boundary within 280 chars'. Input: wikiArticle.summary = 300-char string with spaces. Assert: output contains '…', does NOT contain the full 300-char string, truncated text ends on a word boundary.

## Expected Outcome

Test exists and is RED (renderer not yet fixed). Test name matches exactly.
