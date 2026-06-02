FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/order-service/package*.json ./services/order-service/

RUN npm ci

COPY shared/ ./shared/
RUN npm run build -w shared

COPY services/order-service/ ./services/order-service/
RUN npm run build -w services/order-service

# ─── Production Stage ────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/order-service/package.json ./services/order-service/
COPY --from=builder /app/services/order-service/dist ./services/order-service/dist

ENV NODE_ENV=production
EXPOSE 5003

CMD ["npm", "start", "-w", "services/order-service"]
