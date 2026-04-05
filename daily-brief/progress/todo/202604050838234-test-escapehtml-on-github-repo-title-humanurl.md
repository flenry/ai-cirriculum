# Task: Test: escapeHtml on GitHub repo, title, humanUrl

**Status:** todo
**Created:** 2026-04-05 16:38:23
**ID:** 202604050838234

---

## Description

Write a test named 'escapes HTML in GitHub notification fields'. Input: one ghNotification with repo='<script>repo</script>', title='<b>title</b>', humanUrl='https://github.com/x?a=<evil>'. Assert: output contains '&lt;script&gt;', '&lt;b&gt;', '&lt;evil&gt;'; does NOT contain '<script>' or '<b>'.

## Expected Outcome

Test is GREEN immediately (renderer already applies escapeHtml to gh fields).
