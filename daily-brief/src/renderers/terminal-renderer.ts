import chalk from 'chalk';
import type { DailyBrief } from '../types/brief';

export function renderToTerminal(brief: DailyBrief): void {
  const divider = '═'.repeat(36);

  console.log(divider);
  console.log(chalk.bold.cyan(`  📰 DAILY BRIEF — ${brief.generatedAt}`));
  console.log(divider);
  console.log();

  // Weather section
  console.log(chalk.bold.yellow('🌤  WEATHER'));
  if (brief.weather) {
    console.log(
      `  ${brief.weather.lat}°, ${brief.weather.lon}°: ${brief.weather.tempC}°C, feels like ${brief.weather.feelsLikeC ?? 'N/A'}°C | ${brief.weather.description}`
    );
    console.log(`  Wind: ${brief.weather.windSpeedKmh} km/h`);
  } else {
    console.log(chalk.dim('  ⚠ Weather unavailable'));
  }
  console.log();

  // HN section
  console.log(chalk.bold.yellow('📰  TOP HN STORIES'));
  if (brief.hnStories.length === 0) {
    console.log(chalk.dim('  ⚠ No HN stories'));
  } else {
    brief.hnStories.slice(0, 5).forEach((story, i) => {
      console.log(
        `  ${i + 1}. ${chalk.dim(`[${story.points} pts]`)} ${story.title} (${story.author}) — ${chalk.blue.underline(story.url ?? 'N/A')}`
      );
    });
  }
  console.log();

  // GitHub section
  console.log(chalk.bold.yellow('🔔  GITHUB NOTIFICATIONS'));
  if (brief.ghNotifications.length === 0) {
    console.log(chalk.dim('  ⚠ No GitHub notifications'));
  } else {
    const unreadCount = brief.ghNotifications.filter((n) => n.unread).length;
    console.log(chalk.bold.yellow(`🔔  GITHUB NOTIFICATIONS (${unreadCount} unread)`));
    brief.ghNotifications.slice(0, 10).forEach((n) => {
      const typeLabel = n.type === 'PullRequest' ? 'PR' : n.type === 'Issue' ? 'Issue' : n.type;
      console.log(`  • [${typeLabel}] ${n.repo} — ${n.title} — ${chalk.blue.underline(n.humanUrl)}`);
    });
  }
  console.log();

  // Wikipedia section
  console.log(chalk.bold.yellow('📖  WIKIPEDIA'));
  if (brief.wikiArticle) {
    console.log(chalk.bold.yellow(`📖  WIKIPEDIA: ${brief.wikiArticle.title}`));
    console.log(`  ${brief.wikiArticle.summary}`);
    console.log(`  Read more: ${chalk.blue.underline(brief.wikiArticle.url)}`);
  } else {
    console.log(chalk.dim('  ⚠ Wikipedia unavailable'));
  }
  console.log();

  console.log(divider);
}
