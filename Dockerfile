FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./

# Run as non-root
RUN chown -R node:node /app
USER node

EXPOSE 10000
CMD ["node", "server.js"]
