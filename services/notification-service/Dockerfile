
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for installing dependencies
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/notification-service/package*.json ./services/notification-service/

# Install dependencies
RUN npm ci

# Copy shared library and build it
COPY shared/ ./shared/
RUN npm run build -w shared

# Copy notification-service and build it
COPY services/notification-service/ ./services/notification-service/
RUN npm run build -w services/notification-service

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and dependencies
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/notification-service/package.json ./services/notification-service/
COPY --from=builder /app/services/notification-service/dist ./services/notification-service/dist

ENV NODE_ENV=production
EXPOSE 5006

CMD [ "npm", "start", "-w", "services/notification-service" ]



FROM node:18-alpine

WORKDIR /usr/src/app

# Copy root workspace package and lock files
COPY package*.json ./


# Copy workspaces configurations
COPY shared/package*.json ./shared/
COPY services/notification-service/package*.json ./services/notification-service/

# Install monorepo dependencies
RUN npm install

# Copy source code files
COPY shared/ ./shared/
COPY services/notification-service/ ./services/notification-service/

# Build TypeScript bundles
RUN npm run build -w shared
RUN npm run build -w services/notification-service

EXPOSE 5006

CMD ["npm", "start", "-w", "services/notification-service"]

