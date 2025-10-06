# frontend/Dockerfile
# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend files
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the React application with Nginx (lightweight web server)
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Remove default Nginx configuration
RUN rm -rf ./*

# Copy the built React app from the builder stage
COPY --from=builder /app/build .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx will serve on
EXPOSE 3000

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]