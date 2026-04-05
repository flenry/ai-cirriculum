import { fetchWeather } from '../api/weather-api';
import { fetchHNStories } from '../api/hn-api';
import { fetchGHNotifications } from '../api/github-api';
import { fetchWikiArticle } from '../api/wikipedia-api';
import type { Config } from '../config';
import type { DailyBrief } from '../types/brief';

export async function generateBrief(config: Config): Promise<DailyBrief> {
  const [weatherResult, hnResult, ghResult, wikiResult] = await Promise.allSettled([
    fetchWeather(config.weatherLat, config.weatherLon),
    fetchHNStories(),
    fetchGHNotifications(config.githubToken),
    fetchWikiArticle(),
  ]);

  const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
  const hnStories = hnResult.status === 'fulfilled' ? (hnResult.value ?? []) : [];
  const ghNotifications = ghResult.status === 'fulfilled' ? (ghResult.value ?? []) : [];
  const wikiArticle = wikiResult.status === 'fulfilled' ? wikiResult.value : null;

  return {
    generatedAt: new Date().toISOString(),
    weather,
    hnStories,
    ghNotifications,
    wikiArticle,
    status: {
      weather: { ok: weather !== null },
      hn: { ok: hnResult.status === 'fulfilled' },
      github: { ok: ghResult.status === 'fulfilled' },
      wikipedia: { ok: wikiArticle !== null },
    },
  };
}
