# ==========================================
# Stage 1: Base (Tools & Config)
# ==========================================
FROM node:20-bookworm-slim AS base
# Enable Yarn 4
RUN corepack enable && corepack prepare yarn@4.0.2 --activate
WORKDIR /app

# ==========================================
# Stage 2: Builder (Compiles JS Bundle)
# ==========================================
FROM base AS builder
# Install build tools for native modules (needed for installation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 1. Copy ONLY dependency definitions first (Better caching)
#    Copy root files and package.json files from workspaces
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json

# 2. Install ALL dependencies (frozen lockfile)
# Skip building native modules here - we only need them for the JS build
# Native modules will be properly built in the prod-deps stage
# Use 6GB of available 7GB on GitHub runners (leave 1GB for system)
RUN NODE_OPTIONS="--max-old-space-size=6144" yarn install --immutable --mode=skip-build

# 3. Copy source code
COPY packages ./packages

# 4. Build the bundle
#    (Ensure your backend package.json script "build" runs "vite build")
RUN yarn build

# 5. Create data directory for SQLite database
RUN mkdir -p /app/data

# ==========================================
# Stage 3: Production Native Modules (Debian)
# ==========================================
# We create a fresh stage to install ONLY production dependencies.
# This ensures we get fresh, clean native binaries compatible with distroless (Debian-based).
FROM node:20-bookworm-slim AS prod-deps
# Enable Yarn 4
RUN corepack enable && corepack prepare yarn@4.0.2 --activate
# Install build tools for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/backend/package.json ./packages/backend/package.json

# Focus ONLY on backend production deps
# This generates a clean node_modules with bcrypt/sqlite3 binaries compatible with Debian
# Use 6GB of available 7GB on GitHub runners (leave 1GB for system)
WORKDIR /app/packages/backend
RUN NODE_OPTIONS="--max-old-space-size=6144" yarn workspaces focus --production

# ==========================================
# Stage 4: Production Runner (Distroless)
# ==========================================
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS production

# OCI metadata labels are automatically injected by GitHub Actions via docker/metadata-action
# Only include static labels that don't change between builds
LABEL org.opencontainers.image.base.name="gcr.io/distroless/nodejs20-debian12:nonroot" \
      org.label-schema.vendor="Gautam Krishna R" \
      app.name="otpshare" \
      app.component="otp-manager" \
      app.part-of="otpshare-monorepo"

WORKDIR /app

# 1. Copy the Bundled JS (Your code)
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/frontend/dist ./packages/frontend/dist

# 2. Copy the healthcheck script
COPY --from=builder /app/packages/backend/healthcheck.js ./packages/backend/healthcheck.js

# 3. Copy the Native Modules (External deps)
COPY --from=prod-deps /app/node_modules ./node_modules

# 4. Setup SQLite Data Directory and create data volume with proper permissions
COPY --from=builder --chown=nonroot:nonroot /app/packages/backend/dist/db/migrations ./packages/backend/dist/db/migrations
COPY --from=builder --chown=nonroot:nonroot /app/data ./data

ENV NODE_ENV=production \
    PORT=3001 \
    DATABASE_PATH=/app/data/otpmanager.db

EXPOSE 3001

# Healthcheck using exec form with dedicated script (compatible with distroless)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["/nodejs/bin/node", "packages/backend/healthcheck.js"]

CMD ["packages/backend/dist/index.js"]
