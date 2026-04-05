# Task: types: src/types/brief.ts — shared DailyBrief interfaces

**Status:** for-review
**Created:** 2026-04-05 15:43:09
**ID:** 202604050743092

---

## Description

Create `src/types/brief.ts` with exact type declarations. No logic — pure TypeScript interfaces.

Copy-paste exactly:
```ts
export interface SectionStatus { ok: boolean; error?: string }
export interface WeatherData {
  lat: number; lon: number; tempC: number; feelsLikeC: number | null;
  humidity: number | null; description: string; windSpeedKmh: number; isDay: boolean;
}
export interface HNStory {
  id: string; title: string; url: string | null; points: number;
  commentCount: number; author: string;
}
export interface GHNotification {
  id: string; reason: string; unread: boolean; title: string; type: string;
  repo: string; repoUrl: string; humanUrl: string; updatedAt: string;
}
export interface WikiArticle {
  title: string; summary: string; url: string; thumbnailUrl: string | null;
}
export interface DailyBrief {
  generatedAt: string;
  weather: WeatherData | null;
  hnStories: HNStory[];
  ghNotifications: GHNotification[];
  wikiArticle: WikiArticle | null;
  status: {
    weather: SectionStatus; hn: SectionStatus;
    github: SectionStatus; wikipedia: SectionStatus;
  };
}
```

No test file needed — TypeScript compilation is the test.

## Expected Outcome

File `src/types/brief.ts` exists. `tsc --noEmit` passes. All other modules can `import type { DailyBrief } from '../types/brief'`.

---

## Review

**Moved to Review:** 2026-04-05 15:58:06
**PR:** _(no PR — direct commit)_

### What Was Done

Created src/types/brief.ts with all shared type interfaces: SectionStatus, WeatherData, HNStory, GHNotification, WikiArticle, DailyBrief. File matches exact specification from task.

### How It Was Tested

Verified file exists with correct TypeScript interfaces. TypeScript compilation test (tsc --noEmit) - broader codebase has import extension issues (NodeNext requires .js extensions) but types file itself is correct.
