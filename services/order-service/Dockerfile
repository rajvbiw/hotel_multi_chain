FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for installing dependencies
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/order-service/package*.json ./services/order-service/

# Install dependencies
RUN npm ci

# Copy shared library and build it
COPY shared/ ./shared/
RUN npm run build -w shared

# Copy order-service and build it
COPY services/order-service/ ./services/order-service/
RUN npm run build -w services/order-service

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and dependencies
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/order-service/package.json ./services/order-service/
COPY --from=builder /app/services/order-service/dist ./services/order-service/dist

ENV NODE_ENV=production
EXPOSE 5003

CMD [ "npm", "start", "-w", "services/order-service" ]
