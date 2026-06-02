FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/menu-service/package*.json ./services/menu-service/

# Install all workspace dependencies
RUN npm ci

# Copy and build shared library first
COPY shared/ ./shared/
RUN npm run build -w shared

# Copy and build menu-service
COPY services/menu-service/ ./services/menu-service/
RUN npm run build -w services/menu-service

# ─── Production Stage ───────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy package files for workspace resolution
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy shared lib artifacts
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist

# Copy service artifacts
COPY --from=builder /app/services/menu-service/package.json ./services/menu-service/
COPY --from=builder /app/services/menu-service/dist ./services/menu-service/dist

ENV NODE_ENV=production
EXPOSE 5002

CMD ["npm", "start", "-w", "services/menu-service"]
