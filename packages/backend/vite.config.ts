import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { builtinModules } from 'node:module';

export default defineConfig({
  build: {
    // Treat this as a library/backend build
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs'],
      fileName: 'index.cjs',
    },
    rollupOptions: {
      // Mark node built-ins (path, fs, etc.) as external
      external: [
        'bcrypt',
        'better-sqlite3',
        'iconv-lite',
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
    },
    // Output directory
    outDir: 'dist',
    emptyOutDir: true,
    target: 'node18', // Or 'esnext' if running on Bun
    minify: false, // Set to true if you want to obfuscate code
  },
  ssr: {
    // This forces Vite to bundle ALL dependencies except those marked external above
    noExternal: /^(?!bcrypt|better-sqlite3)/,
  },
});
