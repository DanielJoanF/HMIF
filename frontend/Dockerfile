# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments with production defaults
ARG VITE_API_URL=https://hmif-usd.org/api
ARG VITE_CHATBOT_API_URL=https://hmif-usd.org/chatbot

# Map ARGs to ENVs for Vite build time
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CHATBOT_API_URL=${VITE_CHATBOT_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
