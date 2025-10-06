# Stage 1: Build the TypeScript application
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline
COPY tsconfig.json ./
COPY src ./src

RUN mkdir -p dist && npm run build

# Stage 2: Run the application
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm ci --only=production --prefer-offline
EXPOSE 5000
CMD ["npm", "start"]
