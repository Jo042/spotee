FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build && echo "=== dist contents ===" && ls -la dist/

EXPOSE 4000

CMD ["node", "dist/main.js"]