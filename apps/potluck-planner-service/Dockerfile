# Single image containing the NestJS API and the Angular UI.
# Build via Nx (builds both apps first): npx nx docker-build potluck-planner-service
# Build context is dist/apps, so both build outputs must exist.
ARG NODE_IMAGE=node:24-alpine

FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY potluck-planner-service/package.json potluck-planner-service/package-lock.json ./
# Optional build secret "npm_ca": extra CA bundle for corporate registries/TLS proxies (not persisted in the image).
RUN --mount=type=secret,id=npm_ca,required=false \
    if [ -s /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; \
    npm ci --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force

FROM ${NODE_IMAGE}
WORKDIR /app

ENV NODE_ENV=production \
    PLANNER_SERVER_PORT=3000 \
    DB_HOST=postgres \
    DB_PORT=5432 \
    DB_USER=potluck \
    DB_NAME=potluck \
    JWT_ISSUER=potluck-planner-api \
    JWT_AUDIENCE=potluck-planner-ui \
    UI_DIST_PATH=/app/ui
# Secrets must be supplied at runtime: DB_PASSWORD, JWT_SECRET (>= 32 chars)
# and optionally INITIAL_ADMIN_PASSWORD (>= 8 chars) to seed the first admin.

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node potluck-planner-service/package.json potluck-planner-service/main.js ./
COPY --chown=node:node potluck-planner-ui/browser ./ui

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PLANNER_SERVER_PORT || 3000) + '/api/potlucks').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "main.js"]
