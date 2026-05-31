FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for installing dependencies
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/menu-service/package*.json ./services/menu-service/

# Install dependencies
RUN npm ci

# Copy shared library and build it
COPY shared/ ./shared/
RUN npm run build -w shared

# Copy menu-service and build it
COPY services/menu-service/ ./services/menu-service/
RUN npm run build -w services/menu-service

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and dependencies
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/menu-service/package.json ./services/menu-service/
COPY --from=builder /app/services/menu-service/dist ./services/menu-service/dist

ENV NODE_ENV=production
EXPOSE 5002

CMD [ "npm", "start", "-w", "services/menu-service" ]
