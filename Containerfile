# ==========================================
# Stage 1: Base (Tools & Config)
# ==========================================
FROM node:20-alpine AS base
# Enable Yarn 4
RUN corepack enable && corepack prepare yarn@4.0.2 --activate
WORKDIR /app

# ==========================================
# Stage 2: Builder (Compiles JS Bundle)
# ==========================================
FROM base AS builder
# Install build tools for native modules (needed for installation)
# Use --no-scripts to avoid QEMU ARM emulation issues with busybox triggers
RUN apk add --no-cache --no-scripts python3 make g++

# 1. Copy ONLY dependency definitions first (Better caching)
#    Copy root files and package.json files from workspaces
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json

# 2. Install ALL dependencies (frozen lockfile)
RUN yarn install --immutable

# 3. Copy source code
COPY . .

# 4. Build the bundle
#    (Ensure your backend package.json script "build" runs "vite build")
RUN yarn build

# ==========================================
# Stage 3: Production Native Modules
# ==========================================
# We create a fresh stage to install ONLY production dependencies.
# This ensures we get fresh, clean native binaries for the backend.
FROM base AS prod-deps
# Use --no-scripts to avoid QEMU ARM emulation issues with busybox triggers
RUN apk add --no-cache --no-scripts python3 make g++

COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/backend/package.json ./packages/backend/package.json

# Focus ONLY on backend production deps
# This generates a clean node_modules with bcrypt/sqlite3 binaries
WORKDIR /app/packages/backend
RUN yarn workspaces focus --production

# ==========================================
# Stage 4: Production Runner
# ==========================================
FROM node:20-alpine AS production

# Install dumb-init (workaround for QEMU ARM emulation issue with busybox triggers)
RUN apk add --no-cache --no-scripts dumb-init || \
    (apk add --no-cache --allow-untrusted dumb-init 2>/dev/null || \
    apk add --no-cache dumb-init)

WORKDIR /app

# 1. Copy the Bundled JS (Your code)
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/frontend/dist ./packages/frontend/dist

# 2. Copy the Native Modules (External deps)
#    We copy the ENTIRE node_modules folder from the specific workspace
#    This guarantees we don't miss hidden dependencies.
COPY --from=prod-deps /app/node_modules ./node_modules

# 3. Verify migrations were copied (debug step)
RUN ls -la ./packages/backend/dist/db/migrations/ || echo "Migrations folder missing!"

# 4. Setup SQLite Data Directory
RUN mkdir -p /app/data && chown -R node:node /app

USER node

ENV NODE_ENV=production \
    PORT=3001 \
    DATABASE_PATH=/app/data/otpmanager.db

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "import('http').then(http => http.default.get('http://localhost:3001/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)))"

ENTRYPOINT ["dumb-init", "--"]

# Note: Since we copied node_modules to the root /app/node_modules,
# Node will find them automatically when running the script.
CMD ["node", "packages/backend/dist/index.js"]
