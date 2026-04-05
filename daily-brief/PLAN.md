# Plan: Expand HTML Renderer Test Suite + Fix Renderer Bugs

## Goal
All confirmed test gaps are covered with passing Vitest tests, the Wikipedia
truncation bug is fixed in `src/renderers/html-renderer.ts`, and thumbnailUrl
rendering is implemented — with ≥90% statement coverage on the renderer.

---

## Must-Haves (goal-backward)

- [ ] Wikipedia summary is truncated at word boundary ≤280 chars (bug fix)
- [ ] Wikipedia thumbnailUrl is rendered as `<img>` when non-null (feature gap)
- [ ] Dark mode background color `#0d1117` appears in HTML output
- [ ] GitHub fields (repo, title, humanUrl) are XSS-escaped
- [ ] GitHub notifications render correctly when data is present
- [ ] `<meta charset="UTF-8">` and `<meta name="viewport"` exist in output
- [ ] `feelsLikeC: null` renders as "N/A", not "null" or "undefined"
- [ ] Wikipedia extract <280 chars is preserved verbatim (no truncation)
- [ ] Wikipedia extract exactly at word boundary truncates cleanly
- [ ] All 5 existing tests continue to pass (no regressions)

---

## Out of Scope

- Redesigning the renderer's HTML structure (DESIGN.md describes future Sanji work)
- Terminal renderer tests
- DB or API layer changes
- Playwright / E2E tests
- CSS custom properties refactor (design system upgrade is Sanji's next task)

---

## Tasks

### Chunk 1: TDD — Failing Tests First (Usopp writes, Sanji makes pass)

- [ ] **Task 1.1 — Test: Wikipedia truncation (failing)**
  - File: `tests/renderers/html-renderer.test.ts`
  - Test name: `'truncates Wikipedia summary at word boundary within 280 chars'`
  - Input: `wikiArticle.summary` = a string of exactly 300 chars with spaces
    (e.g. `'word '.repeat(60)` → 300 chars). Ensure there's a word that starts
    after char 280.
  - Expected: output does NOT contain the full 300-char string; DOES contain
    `'…'` (ellipsis); truncated text ends on a word boundary (no partial word
    before `…`).
  - Must FAIL before Task 2.1 (renderer fix).
  - Edge case: summary is exactly 280 chars → no truncation.
  - Reference: DESIGN.md §"Wikipedia Truncation Rule"

- [ ] **Task 1.2 — Test: Wikipedia extract < 280 chars (must stay full)**
  - File: `tests/renderers/html-renderer.test.ts`
  - Test name: `'preserves Wikipedia summary under 280 chars without truncation'`
  - Input: `summary = 'Short summary under limit.'` (26 chars)
  - Expected: output contains exactly `'Short summary under limit.'`, no `'…'`
  - Reference: DESIGN.md §"Wikipedia Truncation Rule"

- [ ] **Task 1.3 — Test: Wikipedia truncation at exact word boundary (300-char, known last word)**
  - File: `tests/renderers/html-renderer.test.ts`
  - Test name: `'truncates at last word boundary before 280 chars not mid-word'`
  - Input: construct summary so a word straddles the 280-char boundary:
    `'a'.repeat(275) + ' boundary extra'` → 291 chars; last space before 280 is
    at index 275 → truncated output should end with `'aaa… '` → no, should be
    `'a'.repeat(275) + '…'`
  - Assert: output contains `'a'.repeat(275) + '…'` and does NOT contain `'boundary'`
  - Reference: DESIGN.md §"Wikipedia Truncation Rule"

- [ ] **Task 1.4 — Test: Dark mode CSS background color**
  - File: `tests/renderers/html-renderer.test.ts`
  - Test name: `'output contains dark mode background color #0d1117'`
  - Input: `fullBrief` (existing fixture)
  - Expected: `result.includes('background: #0d1117')` or
    `result.includes('background:#0d1117')` — either form is acceptable;
    use a regex: `/background:\s*#0d1117/`
  - Reference: DESIGN.md §Color Palette, `html-renderer.ts` line with `body { background: #0d1117`

- [ ] **Task 1.5 — Test: escapeHtml on GitHub repo, title, humanUrl**
  - File: `tests/renderers/html-renderer.test.ts`
  - Test name: `'escapes HTML in GitHub notification fields'`
  - Input: one `ghNotification` with:
    - `repo: '<script>repo</script>'`
    - `title: '<b>title</b>'`
    - `humanUrl: 'https://github.com/x?a=<evil>'`
  - Expected:
    - `result` contains `'&lt;script&gt;'`
    - `result` contains `'&lt;b&gt;'`
    - `result` contains `'&lt;evil&gt;'`
    - `result` does NOT contain `'<script>'` or `'<b>'`
  - No renderer fix needed (escapeHtml already applied); test confirms it.
  - Reference: DESIGN.md §".gh-list"

- [ ] **Task 1.6 — Test: GitHub notifications non-empty render**
  - File: `tests/renderers/html-renderer.test.ts`
  - Test name: `'renders GitHub notifications with repo and title'`
  - Input: brief with 2 real `GHNotification` objects:
    ```ts
    { id: '1', reason: 'mention', unread: true, title: 'Fix login bug',
      type: 'PullRequest', repo: 'owner/repo', repoUrl: 'https://github.com/owner/repo',
      humanUrl: 'https://github.com/owner/repo/pull/1', updatedAt: '2026-01-01T00:00:00Z' }
    { id: '2', reason: 'subscribed', unread: false, title: 'Add dark mode',
      type: 'Issue', repo: 'owner/other', repoUrl: 'https://github.com/owner/other',
      humanUrl: 'https://github.com/owner/other/issues/5', updatedAt: '2026-01-02T00:00:00Z' }
    ```
  - Expected: output contains `'owner/repo'`, `'Fix login bug'`,
    `'owner/other'`, `'Add dark mode'`
  - Expected: output does NOT contain `'⚠ Unavailable'` in `#github` section

- [ ] **Task 1.7 — Test: charset + viewport meta tags**
  - File: `tests/renderers/html-renderer.test.ts`
  - Test name: `'output contains charset and viewport meta tags'`
  - Input: `fullBrief`
  - Expected:
    - `result.includes('<meta charset="UTF-8">')`
    - `/meta name="viewport"/.test(result)`
  - Reference: DESIGN.md §"<body> Page shell" + skill rule `viewport-meta`

- [ ] **Task 1.8 — Test: feelsLikeC null renders N/A**
  - File: `tests/renderers/html-renderer.test.ts`
  - Test name: `'renders N/A when feelsLikeC is null'`
  - Input: `weather` with `feelsLikeC: null`
  - Expected: output contains `'N/A'`
  - Expected: output does NOT contain `'null'` or `'undefined'`
  - Renderer already handles this (`?? 'N/A'`); test confirms no regression.
  - Reference: `html-renderer.ts` line 9, `brief.weather.feelsLikeC ?? 'N/A'`

- [ ] **Task 1.9 — Test: thumbnailUrl rendered as img (failing until Task 2.2)**
  - File: `tests/renderers/html-renderer.test.ts`
  - Test name: `'renders Wikipedia thumbnail img when thumbnailUrl is set'`
  - Input: `wikiArticle` with `thumbnailUrl: 'https://upload.wikimedia.org/thumb.jpg'`
  - Expected: output contains `'<img'` and `'thumb.jpg'`
  - Must FAIL before Task 2.2 (renderer addition).
  - Reference: DESIGN.md §"Thumbnail Rule", §".wiki-block"

- [ ] **Task 1.10 — Test: thumbnailUrl null renders no img**
  - File: `tests/renderers/html-renderer.test.ts`
  - Test name: `'does not render img when thumbnailUrl is null'`
  - Input: `wikiArticle` with `thumbnailUrl: null` (existing `fullBrief` fixture)
  - Expected: output does NOT contain `'wiki-thumb'` or a stray `<img` in the
    wikipedia section
  - Can only be verified after Task 2.2 adds the conditional img block.

---

### Chunk 2: Renderer Bug Fixes + Feature (Sanji implements)

- [ ] **Task 2.1 — Fix: Wikipedia summary truncation in renderer**
  - File: `src/renderers/html-renderer.ts`
  - Function: `renderToHtml` — `wikiHtml` block
  - Change: before calling `escapeHtml(brief.wikiArticle.summary)`, apply:
    ```ts
    function truncateSummary(text: string, max = 280): string {
      if (text.length <= max) return text;
      const cut = text.slice(0, max);
      const lastSpace = cut.lastIndexOf(' ');
      return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '\u2026';
    }
    ```
    Then use `escapeHtml(truncateSummary(brief.wikiArticle.summary))` in the
    template literal.
  - Outcome: Tasks 1.1 and 1.3 pass; Task 1.2 continues to pass.
  - Reference: DESIGN.md §"Wikipedia Truncation Rule"
  - Do NOT modify any other part of the renderer.

- [ ] **Task 2.2 — Add: thumbnailUrl img rendering**
  - File: `src/renderers/html-renderer.ts`
  - Function: `renderToHtml` — `wikiHtml` block
  - Change: When `brief.wikiArticle.thumbnailUrl` is non-null, prepend:
    ```html
    <img src="${escapeHtml(brief.wikiArticle.thumbnailUrl)}" alt="${escapeHtml(brief.wikiArticle.title)}" class="wiki-thumb">
    ```
    before the summary `<p>`.
  - Outcome: Task 1.9 passes; Task 1.10 passes (null path emits no `<img>`).
  - Reference: DESIGN.md §"Thumbnail Rule"
  - Do NOT modify any other part of the renderer.

---

### Chunk 3: Verify & Close

- [ ] **Task 3.1 — Run full test suite**
  - Command: `npx vitest run --pool=forks --poolOptions.forks.maxForks=2`
  - Outcome: all tests pass (5 existing + 10 new = 15 total for renderer;
    39 other passing tests unaffected)
  - Any failure → fix before proceeding

- [ ] **Task 3.2 — Verify no regressions in passing tests**
  - Confirm the 5 original tests still appear in output as ✓
  - Confirm no TypeScript errors: `npx tsc --noEmit`

---

## Execution Order

```
1.1  Write failing test: Wikipedia truncation
1.2  Write passing test: summary <280 chars preserved
1.3  Write failing test: word-boundary truncation edge case
1.4  Write test: dark mode CSS #0d1117
1.5  Write test: escapeHtml on GitHub fields
1.6  Write test: GitHub notifications render 2 entries
1.7  Write test: charset + viewport meta
1.8  Write test: feelsLikeC null → N/A
1.9  Write failing test: thumbnailUrl renders <img>
1.10 Write test: thumbnailUrl null → no <img>
       ↓ (run suite: 1.1, 1.3, 1.9 should be RED; rest GREEN)
2.1  Fix renderer: truncateSummary helper + apply in wikiHtml
       ↓ (1.1, 1.2, 1.3 now GREEN)
2.2  Fix renderer: add thumbnailUrl <img> block
       ↓ (1.9, 1.10 now GREEN)
3.1  Full suite run — all 15+ tests GREEN
3.2  tsc --noEmit — zero errors
```

---

## TODO
- [ ] Task 1.1 — Test: Wikipedia truncation (failing)
- [ ] Task 1.2 — Test: Wikipedia extract < 280 chars (no truncation)
- [ ] Task 1.3 — Test: Wikipedia word-boundary edge case
- [ ] Task 1.4 — Test: Dark mode background #0d1117
- [ ] Task 1.5 — Test: GitHub XSS escape (repo, title, humanUrl)
- [ ] Task 1.6 — Test: GitHub notifications render with data
- [ ] Task 1.7 — Test: charset + viewport meta tags
- [ ] Task 1.8 — Test: feelsLikeC null → N/A
- [ ] Task 1.9 — Test: thumbnailUrl renders img (failing)
- [ ] Task 1.10 — Test: thumbnailUrl null → no img
- [ ] Task 2.1 — Fix renderer: Wikipedia summary truncation
- [ ] Task 2.2 — Fix renderer: thumbnailUrl img rendering
- [ ] Task 3.1 — Full test suite run, all green
- [ ] Task 3.2 — tsc --noEmit, zero errors
