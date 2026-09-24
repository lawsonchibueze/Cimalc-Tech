import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    // class-validator and class-transformer decorators need the Reflect polyfill.
    setupFiles: ['reflect-metadata'],
    // Services import PrismaService, which checks this at import time.
    env: { DATABASE_URL: 'postgresql://test:test@localhost:5432/test' },
  },
});
