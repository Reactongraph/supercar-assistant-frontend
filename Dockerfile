FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"] 