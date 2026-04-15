# Multi-stage build for production
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install Python & dependencies for chatbot
RUN apk add --no-cache python3 py3-pip py3-virtualenv

# Copy built frontend
COPY --from=frontend-build /app/dist ./dist

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server source
COPY server ./server

# Copy chatbot-api
COPY chatbot-api ./chatbot-api
RUN cd chatbot-api && pip3 install --break-system-packages -r requirements.txt

# Copy .env
COPY .env .

# Expose ports
EXPOSE 5000 8000

# Start script
COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]
