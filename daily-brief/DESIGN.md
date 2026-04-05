# DESIGN.md — daily-brief HTML Renderer

> Design brief for the HTML email/file output of the daily-brief CLI tool.
> This document is the source of truth for all visual decisions. Sanji must not
> deviate from these specs without updating this file first.

---

## Visual Direction

**Aesthetic: Refined GitHub-Dark meets Editorial Print**

Think of the output as a personal morning newspaper printed in a terminal. The
background is deep GitHub-dark (#0d1117) — already in the codebase and a
deliberate choice — but the typography and layout are editorial rather than
utilitarian. Sections feel like broadsheet columns: clear hierarchy, generous
whitespace, and a warm amber accent that evokes candlelight over a morning
coffee. What makes it *not* generic: the use of a serif display font for the
daily header (giving it newspaper authority), a strict monospace for data
values (temperature, points, timestamps), and an accent system that maps
semantically to content type rather than decoration. No gradients, no blurs, no
rounded-for-the-sake-of-it borders.

---

## Color Palette

```
Primary:         #58a6ff   — links, interactive elements, h1 title
Background:      #0d1117   — page/body background
Surface:         #161b22   — section cards (.section background)
Border:          #30363d   — card borders, dividers (1px solid)
Text primary:    #e6edf3   — main readable text (upgraded from #c9d1d9 for better contrast)
Text muted:      #8b949e   — metadata: author, timestamps, counts
Accent:          #f0883e   — section headings (h2), warm editorial amber
Warning:         #d29922   — status warnings, unavailable indicator text
Error:           #f85149   — error states
Success:         #3fb950   — ok status badge
Mono surface:    #1c2128   — code/data value backgrounds (temp, pts fields)
```

All hex values are exact. No Tailwind names. These map directly to CSS custom
properties in the rendered HTML.

---

## Typography

### Display font: **Playfair Display** (Google Fonts)
- Used for: `h1` (the "Daily Brief" masthead)
- Why: Serif letterforms give the brief newspaper authority. The high contrast
  strokes read beautifully at large sizes on dark backgrounds. It is immediately
  recognizable as editorial without being fussy.
- Load: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');`

### Body font: **JetBrains Mono** (Google Fonts)
- Used for: all data values (temperature, points, timestamps), code-like content
- Why: Tabular figures prevent layout jitter across rows of numerical data.
  Monospace is semantically correct for structured data from APIs. It signals
  "this came from a real system."
- Load: `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');`

### Body font: **Source Serif 4** (Google Fonts)
- Used for: body prose (Wikipedia summary, weather description, section content)
- Why: Pairs with Playfair Display as a lower-contrast serif companion. Renders
  crisply at 15–16px on dark backgrounds. Feels like reading a quality
  publication, not a config file.
- Load: `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&display=swap');`

### Full import (combined):
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Type scale:
| Role       | Element   | Size      | Weight | Font              |
|------------|-----------|-----------|--------|-------------------|
| Masthead   | h1        | 2rem      | 700    | Playfair Display  |
| Section hd | h2        | 1.125rem  | 600    | Source Serif 4    |
| Article hd | h3        | 1rem      | 600    | Source Serif 4    |
| Body       | p, li     | 0.9375rem | 400    | Source Serif 4    |
| Data value | .data-val | 0.875rem  | 400    | JetBrains Mono    |
| Label/meta | .meta     | 0.8125rem | 400    | JetBrains Mono    |
| Small      | time      | 0.8125rem | 400    | JetBrains Mono    |

Line-height: 1.65 for body, 1.2 for headings, 1.4 for data rows.

---

## Spacing & Layout

```
Base unit:           8px
Container max-width: 660px
Body padding:        2rem (32px) horizontal, 2rem vertical
Section padding:     1.25rem (20px)
Section margin-top:  1rem (16px)
Component gap:       0.75rem (12px) between list items
Section border:      1px solid #30363d
Section border-left: 3px solid #f0883e (accent stripe on left edge)
```

The left accent stripe (3px amber) on each section card is the single
strongest visual signature — it maps to editorial section-flag markers in
print newspapers. Never remove or vary its color.

---

## Component Inventory

### `<body>` — Page shell
- `background: #0d1117`, `color: #e6edf3`
- `font-family: 'Source Serif 4', Georgia, serif`
- `max-width: 660px; margin: 0 auto; padding: 2rem`

### `.masthead` — Title block
- `h1`: Playfair Display 700, 2rem, `color: #58a6ff`
- `time` below it: JetBrains Mono, 0.8125rem, `color: #8b949e`
- Bottom border: `1px solid #30363d`, padding-bottom 1rem

### `.section` — Card wrapper (weather / hn / github / wikipedia)
- `background: #161b22`
- `border: 1px solid #30363d`
- `border-left: 3px solid #f0883e`
- `border-radius: 6px`
- `padding: 1.25rem`
- `margin: 1rem 0`

### `.section h2` — Section heading
- `color: #f0883e`, `font-size: 1.125rem`, `font-weight: 600`
- `margin-top: 0`, `margin-bottom: 0.75rem`
- Font: Source Serif 4

### `.weather-line` — Weather data row
- Inline: description in body font, numbers wrapped in `<span class="data-val">`
- `data-val`: JetBrains Mono, `color: #e6edf3`, `background: #1c2128`,
  `padding: 1px 5px`, `border-radius: 3px`

### `.story-list` — HN ordered list
- `list-style: none; padding: 0`
- Each `<li>`: `padding: 0.375rem 0`, `border-bottom: 1px solid #21262d`
- Rank number: JetBrains Mono, `color: #8b949e`, width 1.5rem, inline-block
- Title: Source Serif 4, `color: #e6edf3`
- Meta (author · pts): JetBrains Mono `color: #8b949e`, 0.8125rem
- `<a>`: `color: #58a6ff`, `text-decoration: none`; hover not needed (static file)

### `.gh-list` — GitHub notification list
- `list-style: none; padding: 0`
- Each `<li>`: `padding: 0.375rem 0`, `border-bottom: 1px solid #21262d`
- Type badge `[PullRequest]`: JetBrains Mono, `background: #1c2128`,
  `color: #8b949e`, `padding: 1px 4px`, `border-radius: 3px`, `font-size: 0.75rem`
- Repo name: `color: #3fb950` (green — signals "your code")
- Notification title: `color: #e6edf3`
- URL link: `color: #58a6ff`

### `.wiki-block` — Wikipedia article
- `h3 a`: Source Serif 4, 600, `color: #58a6ff`
- Summary `<p>`: Source Serif 4 italic, `color: #e6edf3`, `line-height: 1.7`
- Thumbnail `<img>` (when present): `float: right; margin: 0 0 0.5rem 1rem;
  max-width: 120px; border-radius: 4px; border: 1px solid #30363d`
  — clearfix `overflow: hidden` on `.wiki-block`

### `.unavailable` — Missing data notice
- `color: #d29922` (warning amber, not muted grey — it's a soft alert)
- `font-style: italic`

### CSS custom properties (declared on `:root`):
```css
:root {
  --bg: #0d1117;
  --surface: #161b22;
  --surface-code: #1c2128;
  --border: #30363d;
  --border-subtle: #21262d;
  --text: #e6edf3;
  --text-muted: #8b949e;
  --accent: #f0883e;
  --link: #58a6ff;
  --success: #3fb950;
  --warning: #d29922;
  --error: #f85149;
}
```

---

## Wikipedia Truncation Rule

PRD requirement: summary must be truncated at word boundary within 280 chars.

**Logic** (renderer, not CSS):
```
if summary.length > 280:
  truncated = summary.slice(0, 280)
  last_space = truncated.lastIndexOf(' ')
  display = truncated.slice(0, last_space) + '…'
else:
  display = summary
```

This is a **bug in the current renderer** — it emits the full summary. The fix
lives in `src/renderers/html-renderer.ts` in the `wikiHtml` block.

---

## Thumbnail Rule

When `wikiArticle.thumbnailUrl` is non-null, render:
```html
<img src="{escaped url}" alt="{escaped title}" class="wiki-thumb">
```
inside `.wiki-block`, before the `<p>` summary. The current renderer does not
render thumbnails — this is a gap, not a bug.

---

## What Makes This NOT Generic

This output will be opened in a browser as a standalone HTML file, every
morning, probably in a distraction-free window. It needs to feel like picking
up a physical newspaper from a doorstep — not opening a dashboard. The three
choices that give it personality:

1. **Playfair Display masthead** — single serif word at top signals "editorial
   object", not "web app". Most developer tools use Inter for everything.
2. **Left amber stripe on section cards** — three pixels of `#f0883e` on the
   left edge. Borrowed from print magazine section markers. Immediately
   identifiable as the daily-brief visual signature.
3. **JetBrains Mono for all data, Source Serif for all prose** — two-font
   discipline. Every number (temperature, points, line counts) is monospace
   on a slightly darker pill background (`#1c2128`). Every sentence is serif.
   No sans-serif body text anywhere. This is the opposite of every generic
   dashboard.
