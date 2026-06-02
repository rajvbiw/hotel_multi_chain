FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/loyalty-service/package*.json ./services/loyalty-service/

RUN npm ci

COPY shared/ ./shared/
RUN npm run build -w shared

COPY services/loyalty-service/ ./services/loyalty-service/
RUN npm run build -w services/loyalty-service

# ─── Production Stage ────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/loyalty-service/package.json ./services/loyalty-service/
COPY --from=builder /app/services/loyalty-service/dist ./services/loyalty-service/dist

ENV NODE_ENV=production
EXPOSE 5005

CMD ["npm", "start", "-w", "services/loyalty-service"]
