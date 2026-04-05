# Task: renderer: src/renderers/html-renderer.ts — dark HTML file renderer

**Status:** todo
**Created:** 2026-04-05 15:45:41
**ID:** 202604050745418

---

## Description

Create `src/renderers/html-renderer.ts`. Export `renderToHtml(brief: DailyBrief): string`.

Requirements:
- Return a complete HTML5 string starting with `<!DOCTYPE html>`
- Background: `#0d1117`, text: `#c9d1d9`, font: system font stack
- Inline CSS only — no external stylesheets
- Sections: weather, hn-stories, github, wikipedia — each in a `.section` div
- All 10 HN stories rendered (vs 5 in terminal)
- All GitHub notifications rendered
- Null sections render `<p class="unavailable">⚠ Unavailable</p>` — never omit the section
- URLs as `<a href="...">...</a>`
- Escape user content with `escapeHtml` helper

Exact `escapeHtml` helper (include in file):
```ts
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

Inline CSS to use (minimum):
```css
body { background: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; padding: 2rem; }
h1 { color: #58a6ff; }
.section { background: #161b22; border-radius: 6px; padding: 1rem; margin: 1rem 0; }
.section h2 { color: #f0883e; margin-top: 0; }
a { color: #58a6ff; }
.unavailable { color: #6e7681; font-style: italic; }
time { color: #6e7681; font-size: 0.875rem; }
```

Test file: `tests/renderers/html-renderer.test.ts`
- Test: `'returns string starting with <!DOCTYPE html>'` — assert `result.startsWith('<!DOCTYPE html>')`
- Test: `'null weather renders unavailable notice'` — brief with `weather: null` — assert result contains `'⚠ Unavailable'`
- Test: `'escapes HTML in story title'` — brief with story title `'<script>alert(1)</script>'` — assert result contains `'&lt;script&gt;'`, does NOT contain `'<script>'`
- Test: `'renders all 10 HN stories'` — brief with 10 stories (titles: 'Story 1' through 'Story 10') — assert result contains 'Story 10'
- Test: `'renders section even when null'` — all sections null/empty — assert result contains all 4 section ids: `id="weather"`, `id="hn-stories"`, `id="github"`, `id="wikipedia"`

## Expected Outcome

Test `renderers/html: returns valid HTML string` passes. Test `renderers/html: escapes HTML in story titles` passes. Test `renderers/html: null sections render unavailable notice` passes. File `src/renderers/html-renderer.ts` exports `renderToHtml`.
