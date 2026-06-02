FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/gateway/package*.json ./services/gateway/

RUN npm ci

COPY shared/ ./shared/
RUN npm run build -w shared

COPY services/gateway/ ./services/gateway/
RUN npm run build -w services/gateway

# ─── Production Stage ────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/gateway/package.json ./services/gateway/
COPY --from=builder /app/services/gateway/dist ./services/gateway/dist

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start", "-w", "services/gateway"]
