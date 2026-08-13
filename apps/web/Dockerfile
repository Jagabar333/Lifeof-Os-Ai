FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages

# Copy the web app
COPY apps/web ./apps/web

# Install dependencies for the whole workspace
RUN pnpm install --frozen-lockfile

# Build the shared packages and the web app
RUN pnpm --filter @lifeos/shared build
RUN pnpm --filter @lifeos/web build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm

# Copy built artifacts from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/web

ENV NODE_ENV=production
EXPOSE 3002
CMD ["pnpm", "start"]
