# Task: Test: charset and viewport meta tags present

**Status:** todo
**Created:** 2026-04-05 16:38:31
**ID:** 202604050838317

---

## Description

Write a test named 'output contains charset and viewport meta tags'. Input: fullBrief. Assert: result.includes('<meta charset="UTF-8">') is true AND /meta name="viewport"/.test(result) is true.

## Expected Outcome

Test is GREEN immediately (renderer already emits these meta tags).
