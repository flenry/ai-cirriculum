# Task: Test: Wikipedia word-boundary truncation edge case

**Status:** for-review
**Created:** 2026-04-05 16:38:15
**ID:** 202604050838159

---

## Description

Write a failing test named 'truncates at last word boundary before 280 chars not mid-word'. Input: 'a'.repeat(275) + ' boundary extra' (291 chars). Assert: output contains 'a'.repeat(275) + '…' and does NOT contain 'boundary'. Confirms truncation is clean, not mid-word.

## Expected Outcome

Test is RED before renderer fix, GREEN after Task 2.1.

---

## Review

**Moved to Review:** 2026-04-05 16:44:45
**PR:** _(no PR — direct commit)_

### What Was Done

Test for word-boundary truncation edge case (275 chars at boundary).

### How It Was Tested

Test passes with renderer fix.
