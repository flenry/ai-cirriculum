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
