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

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_GATEWAY_URL
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL

RUN npm run build -w frontend

# Production stage using Nginx
FROM nginx:alpine

# Copy built files to nginx public folder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081

# Premium dynamic runtime API Gateway URL substitution on container startup!
CMD ["sh", "-c", "if [ -n \"$VITE_API_URL\" ]; then find /usr/share/nginx/html -type f -name '*.js' -print0 | xargs -0 sed -i \"s|__GATEWAY_URL__|$VITE_API_URL|g\"; fi && nginx -g 'daemon off;'"]
