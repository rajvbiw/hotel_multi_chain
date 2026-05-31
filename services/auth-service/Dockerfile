<<<<<<< HEAD
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for installing dependencies
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/auth-service/package*.json ./services/auth-service/

# Install dependencies
RUN npm ci

# Copy shared library and build it
COPY shared/ ./shared/
RUN npm run build -w shared

# Copy auth-service and build it
COPY services/auth-service/ ./services/auth-service/
RUN npm run build -w services/auth-service

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and dependencies
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/auth-service/package.json ./services/auth-service/
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist

ENV NODE_ENV=production
EXPOSE 5001

CMD [ "npm", "start", "-w", "services/auth-service" ]
=======
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./


COPY shared/package*.json ./shared/
COPY services/auth-service/package*.json ./services/auth-service/

RUN npm install

COPY shared/ ./shared/
COPY services/auth-service/ ./services/auth-service/

RUN npm run build -w shared
RUN npm run build -w services/auth-service

EXPOSE 5001

CMD ["npm", "start", "-w", "services/auth-service"]
>>>>>>> 80b4808 (add Gitaction and Terraform)
