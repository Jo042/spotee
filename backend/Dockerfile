FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN rm -f tsconfig.build.tsbuildinfo && \
    npm run build 2>&1 && \
    echo "=== dist contents ===" && \
    ls -la dist/ 2>&1 || echo "=== dist/ missing ==="

EXPOSE 4000

CMD ["node", "dist/main.js"]