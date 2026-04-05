# Task: renderer: src/renderers/terminal-renderer.ts — chalk terminal output

**Status:** todo
**Created:** 2026-04-05 15:45:27
**ID:** 202604050745275

---

## Description

Create `src/renderers/terminal-renderer.ts`. Export `renderToTerminal(brief: DailyBrief): void`.

Chalk usage rules (strict):
- Divider + header: `chalk.bold.cyan(...)`
- Section labels: `chalk.bold.yellow(...)`
- Story points: `chalk.dim(...)`
- URLs: `chalk.blue.underline(...)`
- Null section warning: `chalk.dim('  ⚠ [Section] unavailable')`

Structure to print (use `console.log` for each line):
```
════════════════════════════════════════
  📰 DAILY BRIEF — [date string]
════════════════════════════════════════

🌤  WEATHER — [lat]°, [lon]°
  [temp]°C, feels like [feelsLike || 'N/A']°C | [description]
  Wind: [wind] km/h

📰  TOP HN STORIES
  1. [100 pts] Title (author) — https://example.com
  ... top 5 only (brief.hnStories.slice(0, 5))

🔔  GITHUB NOTIFICATIONS ([unread count] unread)
  • [PR]  owner/repo — Title — https://github.com/...
  ... up to 10 (brief.ghNotifications.slice(0, 10))

📖  WIKIPEDIA: Title
  Summary text...
  Read more: https://en.wikipedia.org/wiki/...

════════════════════════════════════════
```

Null/empty handling:
- `brief.weather === null` → print `chalk.dim('  ⚠ Weather unavailable')`
- `brief.wikiArticle === null` → print `chalk.dim('  ⚠ Wikipedia unavailable')`
- `brief.ghNotifications.length === 0` → print `chalk.dim('  ⚠ No GitHub notifications')`
- `brief.hnStories.length === 0` → print `chalk.dim('  ⚠ No HN stories')`

Test file: `tests/renderers/terminal-renderer.test.ts`
- Use `vi.spyOn(console, 'log').mockImplementation(() => {})` to capture output
- Create `fullBrief` with all sections populated, `partialBrief` with `weather: null`
- Test: `'renders full brief without throwing'` — `renderToTerminal(fullBrief)` — assert no throw, `console.log` called multiple times
- Test: `'renders null weather with unavailable notice'` — `renderToTerminal(partialBrief)` — collect all logged strings, assert at least one contains 'unavailable'
- Test: `'shows only top 5 HN stories'` — brief with 10 stories — capture output, assert story 6 title not present

## Expected Outcome

Test `renderers/terminal: renders full brief without throwing` passes. Test `renderers/terminal: renders null weather with unavailable notice` passes. File `src/renderers/terminal-renderer.ts` exports `renderToTerminal`.
