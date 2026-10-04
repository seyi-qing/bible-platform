FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY services/worker ./services/worker
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @bible-platform/worker build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN corepack enable
COPY --from=build /app /app
ENV NODE_ENV=production
CMD ["node","services/worker/dist/main.js"]
