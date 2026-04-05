# Task: Test: GitHub notifications render with data

**Status:** todo
**Created:** 2026-04-05 16:38:27
**ID:** 202604050838279

---

## Description

Write a test named 'renders GitHub notifications with repo and title'. Input: brief with 2 real GHNotification objects (see PLAN.md Task 1.6 for exact data). Assert: output contains 'owner/repo', 'Fix login bug', 'owner/other', 'Add dark mode'. Does NOT contain '⚠ Unavailable' in github section.

## Expected Outcome

Test is GREEN immediately (renderer already maps gh fields to HTML).
