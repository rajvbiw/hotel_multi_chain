FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/inventory-service/package*.json ./services/inventory-service/

RUN npm ci

COPY shared/ ./shared/
RUN npm run build -w shared

COPY services/inventory-service/ ./services/inventory-service/
RUN npm run build -w services/inventory-service

# ─── Production Stage ────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/inventory-service/package.json ./services/inventory-service/
COPY --from=builder /app/services/inventory-service/dist ./services/inventory-service/dist

ENV NODE_ENV=production
EXPOSE 5004

CMD ["npm", "start", "-w", "services/inventory-service"]
