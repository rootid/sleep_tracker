# Stage 1: Build the React Application
FROM docker.io/library/node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the frontend
RUN npm run build


# Stage 2: Production Server
FROM docker.io/library/node:20-alpine

WORKDIR /app

# Install production dependencies for the backend
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend files and the built frontend from Stage 1
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

# Create the data directory for SQLite
RUN mkdir -p /app/data && chown node:node /app/data

# Use a non-root user
USER node

# Expose the API and Web Server port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the Express server
CMD ["npx", "tsx", "server/index.ts"]
