# Task: Test: thumbnailUrl null renders no img

**Status:** for-review
**Created:** 2026-04-05 16:38:41
**ID:** 202604050838412

---

## Description

Write a test named 'does not render img when thumbnailUrl is null'. Input: wikiArticle with thumbnailUrl: null (use fullBrief fixture). Assert: output does NOT contain 'wiki-thumb' or a stray img tag in the wikipedia section.

## Expected Outcome

Test is GREEN after Task 2.2 adds the conditional img block (null path emits nothing).

---

## Review

**Moved to Review:** 2026-04-05 16:44:53
**PR:** _(no PR — direct commit)_

### What Was Done

Test confirming no img renders when thumbnailUrl is null.

### How It Was Tested

Test passes.
