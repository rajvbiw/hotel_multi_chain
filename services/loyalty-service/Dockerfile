<<<<<<< HEAD
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for installing dependencies
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/loyalty-service/package*.json ./services/loyalty-service/

# Install dependencies
RUN npm ci

# Copy shared library and build it
COPY shared/ ./shared/
RUN npm run build -w shared

# Copy loyalty-service and build it
COPY services/loyalty-service/ ./services/loyalty-service/
RUN npm run build -w services/loyalty-service

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and dependencies
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/loyalty-service/package.json ./services/loyalty-service/
COPY --from=builder /app/services/loyalty-service/dist ./services/loyalty-service/dist

ENV NODE_ENV=production
EXPOSE 5005

CMD [ "npm", "start", "-w", "services/loyalty-service" ]
=======
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy root workspace package and lock files
COPY package*.json ./


# Copy workspaces configurations
COPY shared/package*.json ./shared/
COPY services/loyalty-service/package*.json ./services/loyalty-service/

# Install monorepo dependencies
RUN npm install

# Copy source code files
COPY shared/ ./shared/
COPY services/loyalty-service/ ./services/loyalty-service/

# Build TypeScript bundles
RUN npm run build -w shared
RUN npm run build -w services/loyalty-service

EXPOSE 5005

CMD ["npm", "start", "-w", "services/loyalty-service"]
>>>>>>> 80b4808 (add Gitaction and Terraform)
