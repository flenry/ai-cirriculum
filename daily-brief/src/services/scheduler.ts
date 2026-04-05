import cron from 'node-cron';

export function startScheduler(schedule: string, task: () => Promise<void>): void {
  console.log(`[scheduler] Starting with schedule: ${schedule}`);
  cron.schedule(schedule, () => {
    task().catch(console.error);
  });
}
