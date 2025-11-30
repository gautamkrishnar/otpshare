import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtinModules } from 'node:module';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Plugin to copy the migrations folder
// noinspection JSUnusedGlobalSymbols
const copyMigrationsPlugin = () => ({
  name: 'copy-migrations',
  closeBundle() {
    const src = resolve(__dirname, 'src/db/migrations');
    const dest = resolve(__dirname, 'dist/db/migrations');

    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
      console.log('Copied migrations to dist/db/migrations');
    }
  },
});

export default defineConfig({
  plugins: [copyMigrationsPlugin()],
  build: {
    // Treat this as a library/backend build
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Mark node built-ins (path, fs, etc.) as external
      external: [
        'bcrypt',
        'iconv-lite',
        '@libsql/client',
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
    // This forces Vite to bundle ALL dependencies except those marked externally above
    noExternal: /^(?!bcrypt)/,
  },
});
