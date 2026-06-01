
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for installing dependencies
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/gateway/package*.json ./services/gateway/

# Install dependencies
RUN npm ci

# Copy shared library and build it
COPY shared/ ./shared/
RUN npm run build -w shared

# Copy gateway and build it
COPY services/gateway/ ./services/gateway/
RUN npm run build -w services/gateway

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and dependencies
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/gateway/package.json ./services/gateway/
COPY --from=builder /app/services/gateway/dist ./services/gateway/dist

ENV NODE_ENV=production
EXPOSE 5000

CMD [ "npm", "start", "-w", "services/gateway" ]

FROM node:18-alpine

WORKDIR /usr/src/app

# Copy root workspace package and lock files
COPY package*.json ./


# Copy workspaces configurations
COPY shared/package*.json ./shared/
COPY services/gateway/package*.json ./services/gateway/

# Install monorepo dependencies
RUN npm install

# Copy source code files
COPY shared/ ./shared/
COPY services/gateway/ ./services/gateway/

# Build typescript bundles
RUN npm run build -w shared
RUN npm run build -w services/gateway

EXPOSE 5000

CMD ["npm", "start", "-w", "services/gateway"]

