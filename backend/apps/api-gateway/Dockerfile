FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/config/package.json packages/config/
COPY packages/logger/package.json packages/logger/
COPY packages/api-contracts/package.json packages/api-contracts/
COPY apps/api-gateway/package.json apps/api-gateway/
RUN npm ci --workspace=apps/api-gateway --include-workspace-root
COPY packages ./packages
COPY apps/api-gateway ./apps/api-gateway
RUN npm run build -w packages/config
RUN npm run build -w packages/logger
RUN npm run build -w packages/api-contracts
RUN npm run build -w apps/api-gateway
RUN npm prune --omit=dev --workspace=apps/api-gateway --include-workspace-root

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY --from=build /repo/apps/api-gateway/dist ./apps/api-gateway/dist
USER node
WORKDIR /repo/apps/api-gateway
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1
CMD ["node", "dist/server.js"]
