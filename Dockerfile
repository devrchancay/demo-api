# Multi-stage: the first stage resolves production dependencies with the lockfile, the
# second one carries only those plus the sources. TypeScript is not compiled — the service
# runs through tsx, the same way the platform agent runs.

FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# The deploy publishes the host port onto 3000 and binds nothing else.
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src

EXPOSE 3000
USER node

# Informational: the platform deploys with `docker pull` + create, and does not read this.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>{process.exit(r.ok?0:1)}).catch(()=>process.exit(1))"

CMD ["./node_modules/.bin/tsx", "src/server.ts"]
