import 'dotenv/config';
import { z } from 'zod';

export interface Config {
  weatherLat: string;
  weatherLon: string;
  githubToken: string;
  cronSchedule: string;
  htmlOutputPath: string;
  dbPath: string;
}

const EnvSchema = z.object({
  WEATHER_LAT: z.string().min(1),
  WEATHER_LON: z.string().min(1),
  GITHUB_TOKEN: z.string().min(1),
  CRON_SCHEDULE: z.string().default('0 7 * * *'),
  HTML_OUTPUT_PATH: z.string().default('./output/brief.html'),
  DB_PATH: z.string().default('./data/brief.db'),
});

export function loadConfig(): Config {
  const env = EnvSchema.parse(process.env);
  return {
    weatherLat: env.WEATHER_LAT,
    weatherLon: env.WEATHER_LON,
    githubToken: env.GITHUB_TOKEN,
    cronSchedule: env.CRON_SCHEDULE,
    htmlOutputPath: env.HTML_OUTPUT_PATH,
    dbPath: env.DB_PATH,
  };
}
