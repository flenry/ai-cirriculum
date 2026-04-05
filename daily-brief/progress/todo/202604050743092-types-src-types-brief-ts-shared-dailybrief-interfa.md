# Task: types: src/types/brief.ts — shared DailyBrief interfaces

**Status:** todo
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
