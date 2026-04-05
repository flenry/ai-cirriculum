import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
    pool: 'forks',
    poolOptions: { forks: { maxForks: 2 } },
    coverage: {
      provider: 'v8',
      thresholds: { statements: 90 },
    },
  },
});
