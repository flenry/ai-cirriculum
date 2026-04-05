# Task: Test: Wikipedia word-boundary truncation edge case

**Status:** todo
**Created:** 2026-04-05 16:38:15
**ID:** 202604050838159

---

## Description

Write a failing test named 'truncates at last word boundary before 280 chars not mid-word'. Input: 'a'.repeat(275) + ' boundary extra' (291 chars). Assert: output contains 'a'.repeat(275) + '…' and does NOT contain 'boundary'. Confirms truncation is clean, not mid-word.

## Expected Outcome

Test is RED before renderer fix, GREEN after Task 2.1.
