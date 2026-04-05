# Task: Test: thumbnailUrl renders img when set (failing)

**Status:** for-review
**Created:** 2026-04-05 16:38:37
**ID:** 202604050838375

---

## Description

Write a failing test named 'renders Wikipedia thumbnail img when thumbnailUrl is set'. Input: wikiArticle with thumbnailUrl: 'https://upload.wikimedia.org/thumb.jpg'. Assert: output contains '<img' and 'thumb.jpg'. Must FAIL before Task 2.2 adds the img block.

## Expected Outcome

Test is RED before renderer fix, GREEN after Task 2.2.

---

## Review

**Moved to Review:** 2026-04-05 16:44:53
**PR:** _(no PR — direct commit)_

### What Was Done

Test for Wikipedia thumbnail img rendering when thumbnailUrl is set.

### How It Was Tested

Test passes with renderer fix.
