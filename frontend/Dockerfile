# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and frontend package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci

# Copy frontend source and build it
COPY frontend/ ./frontend/

ARG VITE_GATEWAY_URL
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL

RUN npm run build -w frontend

# Production stage using Nginx
FROM nginx:alpine

# Copy built files to nginx public folder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
