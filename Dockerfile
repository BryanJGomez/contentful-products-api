FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --prefer-offline --no-audit --progress=false

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Create production image
FROM node:20-alpine AS production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS=--enable-source-maps

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev --prefer-offline --no-audit --progress=false

# Copy built application
COPY --from=builder /app/dist ./dist

# Configure permissions
RUN chown -R node:node .

# Change to non-root user
USER node

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]
