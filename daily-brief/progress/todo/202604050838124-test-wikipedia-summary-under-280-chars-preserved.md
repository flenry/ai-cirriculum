# Task: Test: Wikipedia summary under 280 chars preserved

**Status:** todo
**Created:** 2026-04-05 16:38:12
**ID:** 202604050838124

---

## Description

Write a passing Vitest test in tests/renderers/html-renderer.test.ts named 'preserves Wikipedia summary under 280 chars without truncation'. Input: summary = 'Short summary under limit.' (26 chars). Assert: output contains exact string, no ellipsis.

## Expected Outcome

Test passes immediately (renderer does not truncate short text). GREEN from the start.
