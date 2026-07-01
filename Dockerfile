# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Compile TypeScript + run Vite build (via @adonisjs/vite/build_hook)
RUN node ace build

# Install production-only deps inside the compiled output directory
WORKDIR /app/build
RUN npm ci --omit=dev

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy with node ownership so the non-root user can write at runtime
COPY --from=builder --chown=node:node /app/build ./

# tmp must exist and be writable by node before we drop privileges
RUN mkdir -p tmp && chown node:node tmp

USER node

EXPOSE 3000

CMD ["node", "--dns-result-order=ipv4first", "build/bin/server.js"]
